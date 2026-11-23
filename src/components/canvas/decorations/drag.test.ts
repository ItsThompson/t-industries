import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/svelte';
import OpeningComposition from './OpeningComposition.svelte';
import MarginObjects from './MarginObjects.svelte';

let width = 1400;
let pageHeight = 2200;
let nowMs = 0;
let reducedMotion = false;
let frames: Map<number, FrameRequestCallback>;
let nextFrameId = 0;
let bases: Map<Element, DOMRect>;
let motionQuery: EventTarget;
let page: HTMLDivElement;

function advanceFrames(count = 180): void {
  for (let index = 0; index < count; index += 1) {
    nowMs += 1000 / 60;
    const pending = [...frames.values()];
    frames.clear();
    for (const callback of pending) callback(nowMs);
  }
}

function offset(image: HTMLImageElement): { x: number; y: number } {
  return {
    x: Number.parseFloat(image.style.getPropertyValue('--drag-x')) || 0,
    y: Number.parseFloat(image.style.getPropertyValue('--drag-y')) || 0,
  };
}

function pointer(
  image: HTMLImageElement,
  type: string,
  clientX: number,
  clientY: number,
  options: PointerEventInit = {},
): PointerEvent {
  const event = new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    pointerId: 1,
    pointerType: 'mouse',
    isPrimary: true,
    button: 0,
    clientX,
    clientY,
    ...options,
  });
  image.dispatchEvent(event);
  return event;
}

function mount(
  component: typeof OpeningComposition | typeof MarginObjects = OpeningComposition,
): HTMLImageElement[] {
  render(component, { target: page });
  const images = [...page.querySelectorAll('img')];
  for (const image of images) {
    let captured: number | null = null;
    image.setPointerCapture = vi.fn((pointerId: number) => { captured = pointerId; });
    image.hasPointerCapture = vi.fn((pointerId: number) => captured === pointerId);
    image.releasePointerCapture = vi.fn(() => { captured = null; });
  }
  return images;
}

function drag(image: HTMLImageElement, x: number, y: number): void {
  const rect = image.getBoundingClientRect();
  const startX = rect.left + rect.width / 2;
  const startY = rect.top + rect.height / 2;
  pointer(image, 'pointerdown', startX, startY);
  pointer(image, 'pointermove', startX + x, startY + y);
  pointer(image, 'pointerup', startX + x, startY + y);
}

function finishWiggle(image: HTMLImageElement, animationName = 'canvas-decoration-reject'): void {
  image.dispatchEvent(Object.assign(new Event('animationend', { bubbles: true }), { animationName }));
}

function protect(tag: string, rect: DOMRect): HTMLElement {
  const element = document.createElement(tag);
  element.textContent = 'Protected content';
  bases.set(element, rect);
  page.appendChild(element);
  return element;
}

function resize(nextWidth: number): void {
  width = nextWidth;
  window.dispatchEvent(new Event('resize'));
}

beforeEach(() => {
  width = 1400;
  pageHeight = 2200;
  nowMs = 0;
  reducedMotion = false;
  frames = new Map();
  bases = new Map();
  motionQuery = new EventTarget();
  page = document.createElement('div');
  page.dataset.decorationPage = '';
  document.body.appendChild(page);
  vi.spyOn(window, 'innerWidth', 'get').mockImplementation(() => width);
  vi.spyOn(performance, 'now').mockImplementation(() => nowMs);
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(++nextFrameId, callback);
    return nextFrameId;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
    get matches() { return reducedMotion; },
    media: query,
    addEventListener: motionQuery.addEventListener.bind(motionQuery),
    removeEventListener: motionQuery.removeEventListener.bind(motionQuery),
  })));
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    if (this === page || this === document.documentElement) {
      return new DOMRect(0, -window.scrollY, width, pageHeight);
    }
    const base = bases.get(this) ?? new DOMRect(100, 120, 100, 100);
    const x = Number.parseFloat(this.style.getPropertyValue('--drag-x')) || 0;
    const y = Number.parseFloat(this.style.getPropertyValue('--drag-y')) || 0;
    return new DOMRect(base.x + x, base.y + y - window.scrollY, base.width, base.height);
  });
});

afterEach(() => {
  cleanup();
  advanceFrames(2);
  page.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe.each([
  ['opening', OpeningComposition],
  ['margin', MarginObjects],
] as const)('%s decorations', (_name, component) => {
  it('lets every icon follow a desktop drag, settle, and stop requesting frames', () => {
    const images = mount(component);
    for (const image of images) {
      drag(image, 240, 180);
      expect(offset(image).x).toBeLessThan(240);
      advanceFrames();
      expect(offset(image).x).toBeCloseTo(240, 1);
      expect(offset(image).y).toBeCloseTo(180, 1);
      expect(image.hasAttribute('data-dragging')).toBe(false);
      expect(image.setPointerCapture).toHaveBeenCalledWith(1);
      expect(image.releasePointerCapture).toHaveBeenCalledWith(1);
    }
    expect(frames.size).toBe(0);
  });

  it('restores the composition when mounted again instead of persisting offsets', () => {
    const [image] = mount(component);
    drag(image, 300, 200);
    advanceFrames();
    expect(offset(image)).toEqual({ x: 300, y: 200 });
    cleanup();
    const [fresh] = mount(component);
    expect(offset(fresh)).toEqual({ x: 0, y: 0 });
  });
});

describe('drops near protected content', () => {
  it('wiggles at an invalid drop before darting back to the previous placement', () => {
    const [image] = mount();
    protect('p', new DOMRect(400, 320, 300, 100));
    pointer(image, 'pointerdown', 150, 170);
    pointer(image, 'pointermove', 450, 370);
    advanceFrames();
    expect(offset(image)).toEqual({ x: 300, y: 200 });
    expect(image.hasAttribute('data-dragging')).toBe(true);

    pointer(image, 'pointerup', 450, 370);
    expect(image.hasAttribute('data-rejected')).toBe(true);
    expect(image.hasAttribute('data-dragging')).toBe(false);
    advanceFrames();
    expect(offset(image)).toEqual({ x: 300, y: 200 });

    finishWiggle(image);
    advanceFrames(1);
    expect(image.hasAttribute('data-rejected')).toBe(false);
    expect(offset(image).x).toBeGreaterThan(0);
    expect(offset(image).x).toBeLessThan(150);
    advanceFrames(20);
    expect(offset(image)).toEqual({ x: 0, y: 0 });
    expect(frames.size).toBe(0);
  });

  it('returns to the last accepted placement rather than the original position', () => {
    const [image] = mount();
    protect('p', new DOMRect(400, 320, 300, 100));
    drag(image, 100, 400);
    advanceFrames();
    expect(offset(image)).toEqual({ x: 100, y: 400 });
    drag(image, 200, -200);
    expect(image.hasAttribute('data-rejected')).toBe(true);
    advanceFrames(2);
    finishWiggle(image);
    advanceFrames();
    expect(offset(image)).toEqual({ x: 100, y: 400 });
    drag(image, 200, -200);
    expect(image.hasAttribute('data-rejected')).toBe(true);
    advanceFrames(2);
    finishWiggle(image);
    advanceFrames();
    expect(offset(image)).toEqual({ x: 100, y: 400 });
  });

  it('does not wiggle after a valid drop', () => {
    const [image] = mount();
    drag(image, 100, 400);
    expect(image.hasAttribute('data-rejected')).toBe(false);
    advanceFrames();
    expect(offset(image)).toEqual({ x: 100, y: 400 });
  });

  it('ignores animation-end events from unrelated animations', () => {
    const [image] = mount();
    protect('p', new DOMRect(400, 320, 300, 100));
    drag(image, 300, 200);
    expect(image.hasAttribute('data-rejected')).toBe(true);
    finishWiggle(image, 'other-animation');
    advanceFrames();
    expect(image.hasAttribute('data-rejected')).toBe(true);
    expect(offset(image)).toEqual({ x: 300, y: 200 });
  });

  it('cancels a wiggle on resize without allowing a late return animation', () => {
    const [image] = mount();
    protect('p', new DOMRect(400, 320, 300, 100));
    drag(image, 100, 400);
    advanceFrames();
    drag(image, 200, -200);
    expect(image.hasAttribute('data-rejected')).toBe(true);
    resize(1200);
    expect(image.hasAttribute('data-rejected')).toBe(false);
    expect(offset(image)).toEqual({ x: 0, y: 0 });
    finishWiggle(image);
    advanceFrames();
    expect(offset(image)).toEqual({ x: 0, y: 0 });
    expect(frames.size).toBe(0);
  });

  it('lets the user grab a wiggling icon and place it without a late return', () => {
    const [image] = mount();
    protect('p', new DOMRect(400, 320, 300, 100));
    drag(image, 300, 200);
    expect(image.hasAttribute('data-rejected')).toBe(true);
    advanceFrames(2);
    pointer(image, 'pointerdown', 450, 370);
    expect(image.hasAttribute('data-rejected')).toBe(false);
    expect(offset(image)).toEqual({ x: 300, y: 200 });
    pointer(image, 'pointermove', 250, 570);
    pointer(image, 'pointerup', 250, 570);
    finishWiggle(image);
    advanceFrames();
    expect(offset(image)).toEqual({ x: 100, y: 400 });
  });

  it('skips a pending wiggle when reduced motion becomes enabled', () => {
    const [image] = mount();
    protect('p', new DOMRect(400, 320, 300, 100));
    drag(image, 300, 200);
    expect(image.hasAttribute('data-rejected')).toBe(true);
    reducedMotion = true;
    motionQuery.dispatchEvent(Object.assign(new Event('change'), { matches: true }));
    expect(image.hasAttribute('data-rejected')).toBe(false);
    expect(offset(image)).toEqual({ x: 0, y: 0 });
    finishWiggle(image);
    advanceFrames();
    expect(offset(image)).toEqual({ x: 0, y: 0 });
  });

  it('cancels the wiggle and returns safely before the page becomes hidden', () => {
    const [image] = mount();
    protect('p', new DOMRect(400, 320, 300, 100));
    drag(image, 300, 200);
    expect(image.hasAttribute('data-rejected')).toBe(true);
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    document.dispatchEvent(new Event('visibilitychange'));
    expect(image.hasAttribute('data-rejected')).toBe(false);
    expect(offset(image)).toEqual({ x: 0, y: 0 });
    nowMs += 60_000;
    finishWiggle(image);
    advanceFrames();
    expect(offset(image)).toEqual({ x: 0, y: 0 });
    expect(frames.size).toBe(0);
  });

  it('keeps the next drag slow after a fast return', () => {
    const [image] = mount();
    protect('p', new DOMRect(400, 320, 300, 100));
    drag(image, 300, 200);
    expect(image.hasAttribute('data-rejected')).toBe(true);
    advanceFrames(2);
    finishWiggle(image);
    advanceFrames();
    expect(offset(image)).toEqual({ x: 0, y: 0 });
    drag(image, 300, 0);
    advanceFrames(1);
    expect(offset(image).x).toBeGreaterThan(0);
    expect(offset(image).x).toBeLessThan(40);
  });

  it('cancels the wiggle and its listener on unmount', () => {
    const [image] = mount();
    protect('p', new DOMRect(400, 320, 300, 100));
    drag(image, 300, 200);
    expect(image.hasAttribute('data-rejected')).toBe(true);
    cleanup();
    expect(image.hasAttribute('data-rejected')).toBe(false);
    const stopped = offset(image);
    finishWiggle(image);
    advanceFrames();
    expect(offset(image)).toEqual(stopped);
    expect(frames.size).toBe(0);
  });

  it('checks the drop destination rather than the lagging image position', () => {
    const [image] = mount();
    protect('p', new DOMRect(400, 320, 300, 100));
    pointer(image, 'pointerdown', 150, 170);
    pointer(image, 'pointermove', 450, 370);
    advanceFrames();
    expect(offset(image)).toEqual({ x: 300, y: 200 });
    pointer(image, 'pointermove', 850, 970);
    pointer(image, 'pointerup', 850, 970);
    advanceFrames();
    expect(offset(image)).toEqual({ x: 700, y: 800 });
  });

  it.each(['h1', 'h2', 'h3', 'p', 'a', 'button'])(
    'protects a whole %s block and corrects immediately with reduced motion',
    (tag) => {
      reducedMotion = true;
      const [image] = mount();
      protect(tag, new DOMRect(400, 320, 300, 100));
      drag(image, 300, 200);
      expect(offset(image)).toEqual({ x: 0, y: 0 });
      expect(image.hasAttribute('data-rejected')).toBe(false);
    },
  );

  it('includes the rotated image bounds in collision detection', () => {
    reducedMotion = true;
    const [image] = mount();
    bases.set(image, new DOMRect(100, 120, 140, 140));
    protect('p', new DOMRect(400, 320, 300, 100));
    drag(image, 170, 200);
    expect(offset(image)).toEqual({ x: 0, y: 0 });
  });

  it('rejects a drop when any part of the image overlaps text', () => {
    reducedMotion = true;
    const [image] = mount();
    protect('p', new DOMRect(400, 320, 300, 100));
    drag(image, 205, 200);
    expect(offset(image)).toEqual({ x: 0, y: 0 });
  });

  it('checks text in document coordinates after the page scrolls', () => {
    reducedMotion = true;
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(600);
    const [image] = mount();
    bases.set(image, new DOMRect(100, 800, 100, 100));
    protect('p', new DOMRect(400, 1000, 300, 100));
    drag(image, 300, 200);
    expect(offset(image)).toEqual({ x: 0, y: 0 });
  });

  it('starts from the original resting position after a resize', () => {
    reducedMotion = true;
    const [image] = mount();
    protect('p', new DOMRect(400, 320, 300, 100));
    drag(image, 100, 400);
    expect(offset(image)).toEqual({ x: 100, y: 400 });
    resize(1200);
    expect(offset(image)).toEqual({ x: 0, y: 0 });
    drag(image, 300, 200);
    expect(offset(image)).toEqual({ x: 0, y: 0 });
  });
});

describe('desktop decoration interactions', () => {
  it('lags behind the pointer, slightly overshoots, and settles without a throw', () => {
    const [image] = mount();
    drag(image, 300, 200);
    advanceFrames(1);
    expect(offset(image).x).toBeGreaterThan(0);
    expect(offset(image).x).toBeLessThan(300);
    let maximum = 0;
    for (let frame = 0; frame < 180; frame += 1) {
      advanceFrames(1);
      maximum = Math.max(maximum, offset(image).x);
    }
    expect(maximum).toBeGreaterThan(300);
    expect(maximum).toBeLessThan(345);
    expect(offset(image).x).toBeCloseTo(300, 1);
  });

  it('gives a laptop a slower response than headphones', () => {
    const images = mount();
    const laptop = images[0];
    const headphones = images[4];
    drag(laptop, 300, 0);
    drag(headphones, 300, 0);
    advanceFrames(6);
    expect(offset(laptop).x).toBeGreaterThan(0);
    expect(offset(laptop).x).toBeLessThan(offset(headphones).x);
  });

  it.each(['touch', 'pen'])('ignores %s input even on a wide screen', (pointerType) => {
    const [image] = mount();
    pointer(image, 'pointerdown', 150, 170, { pointerType });
    pointer(image, 'pointermove', 400, 400, { pointerType });
    advanceFrames();
    expect(offset(image)).toEqual({ x: 0, y: 0 });
    expect(image.setPointerCapture).not.toHaveBeenCalled();
  });

  it('ignores secondary buttons, nonprimary pointers, and other pointer IDs', () => {
    reducedMotion = true;
    const [image] = mount();
    pointer(image, 'pointerdown', 150, 170, { button: 2 });
    expect(image.setPointerCapture).not.toHaveBeenCalled();
    pointer(image, 'pointerdown', 150, 170, { isPrimary: false });
    expect(image.setPointerCapture).not.toHaveBeenCalled();
    pointer(image, 'pointerdown', 150, 170);
    pointer(image, 'pointermove', 400, 400, { pointerId: 2 });
    expect(offset(image)).toEqual({ x: 0, y: 0 });
  });

  it('keeps grabbing from the current visual position without jumping', () => {
    const [image] = mount();
    drag(image, 300, 200);
    advanceFrames(5);
    const previous = offset(image);
    const rect = image.getBoundingClientRect();
    pointer(image, 'pointerdown', rect.left + 20, rect.top + 20);
    expect(offset(image)).toEqual(previous);
    pointer(image, 'pointermove', rect.left + 120, rect.top + 20);
    advanceFrames();
    expect(offset(image).x).toBeCloseTo(previous.x + 100, 1);
  });

  it('keeps the rotated image bounds inside the page throughout spring motion', () => {
    const [image] = mount();
    bases.set(image, new DOMRect(100, 120, 140, 140));
    drag(image, 10_000, 10_000);
    for (let frame = 0; frame < 180; frame += 1) {
      advanceFrames(1);
      const rect = image.getBoundingClientRect();
      expect(rect.right).toBeLessThanOrEqual(width);
      expect(rect.bottom).toBeLessThanOrEqual(pageHeight);
    }
    expect(image.getBoundingClientRect().right).toBeCloseTo(width, 1);
    expect(image.getBoundingClientRect().bottom).toBeCloseTo(pageHeight, 1);
    drag(image, -10_000, -10_000);
    advanceFrames();
    expect(image.getBoundingClientRect().left).toBeCloseTo(0, 1);
    expect(image.getBoundingClientRect().top).toBeCloseTo(0, 1);
  });

  it('uses document coordinates when dragging a scrolled page', () => {
    reducedMotion = true;
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(600);
    const [image] = mount();
    bases.set(image, new DOMRect(100, 800, 100, 100));
    drag(image, 200, 300);
    expect(offset(image)).toEqual({ x: 200, y: 300 });
  });

  it('does not start a background ripple when an icon is grabbed', () => {
    const backdropPress = vi.fn();
    window.addEventListener('pointerdown', backdropPress);
    const [image] = mount();
    const event = pointer(image, 'pointerdown', 150, 170);
    expect(event.defaultPrevented).toBe(true);
    expect(backdropPress).not.toHaveBeenCalled();
    window.removeEventListener('pointerdown', backdropPress);
  });

  it.each(['pointercancel', 'lostpointercapture'])('ends a drag on %s', (eventType) => {
    const [image] = mount();
    pointer(image, 'pointerdown', 150, 170);
    pointer(image, 'pointermove', 350, 370);
    advanceFrames(3);
    expect(offset(image).x).toBeGreaterThan(0);
    expect(image.hasAttribute('data-dragging')).toBe(true);
    pointer(image, eventType, 350, 370);
    const stopped = offset(image);
    pointer(image, 'pointermove', 500, 500);
    advanceFrames();
    expect(offset(image)).toEqual(stopped);
    expect(image.hasAttribute('data-dragging')).toBe(false);
  });

  it('ends a drag when the window loses focus', () => {
    const [image] = mount();
    pointer(image, 'pointerdown', 150, 170);
    pointer(image, 'pointermove', 350, 370);
    advanceFrames(3);
    expect(offset(image).x).toBeGreaterThan(0);
    expect(image.hasAttribute('data-dragging')).toBe(true);
    window.dispatchEvent(new Event('blur'));
    const stopped = offset(image);
    advanceFrames();
    expect(offset(image)).toEqual(stopped);
    expect(image.hasAttribute('data-dragging')).toBe(false);
  });

  it.each(['dragging', 'settling'])('freezes %s motion while the page is hidden', (phase) => {
    const [image] = mount();
    pointer(image, 'pointerdown', 150, 170);
    pointer(image, 'pointermove', 450, 370);
    if (phase === 'settling') pointer(image, 'pointerup', 450, 370);
    advanceFrames(3);
    expect(offset(image).x).toBeGreaterThan(0);
    const stopped = offset(image);
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    document.dispatchEvent(new Event('visibilitychange'));
    nowMs += 60_000;
    advanceFrames(1);
    expect(offset(image)).toEqual(stopped);
    expect(image.hasAttribute('data-dragging')).toBe(false);
    advanceFrames();
    expect(frames.size).toBe(0);
  });

  it('moves immediately for reduced motion and follows preference changes', () => {
    const [image] = mount();
    drag(image, 300, 200);
    advanceFrames(2);
    reducedMotion = true;
    motionQuery.dispatchEvent(Object.assign(new Event('change'), { matches: true }));
    expect(offset(image)).toEqual({ x: 300, y: 200 });
    drag(image, 100, 100);
    expect(offset(image)).toEqual({ x: 400, y: 300 });
    reducedMotion = false;
    motionQuery.dispatchEvent(Object.assign(new Event('change'), { matches: false }));
    drag(image, 100, 100);
    expect(offset(image).x).toBe(400);
    advanceFrames();
    expect(offset(image)).toEqual({ x: 500, y: 400 });
  });

  it('immediately resets every icon on desktop resize, including icons away from edges', () => {
    const images = mount();
    for (const image of images) drag(image, 300, 200);
    advanceFrames();
    for (const image of images) expect(offset(image)).toEqual({ x: 300, y: 200 });

    resize(1200);

    for (const image of images) {
      expect(offset(image)).toEqual({ x: 0, y: 0 });
      expect(image.hasAttribute('data-drag-enabled')).toBe(true);
    }
    advanceFrames();
    expect(frames.size).toBe(0);
    for (const image of images) expect(offset(image)).toEqual({ x: 0, y: 0 });
  });

  it('cancels an active drag and pending motion on a height-only resize', () => {
    const [image] = mount();
    pointer(image, 'pointerdown', 150, 170);
    pointer(image, 'pointermove', 450, 370);
    advanceFrames(3);
    expect(offset(image).x).toBeGreaterThan(0);
    pageHeight = 1600;
    resize(width);
    expect(offset(image)).toEqual({ x: 0, y: 0 });
    expect(image.hasPointerCapture(1)).toBe(false);
    pointer(image, 'pointermove', 600, 500);
    advanceFrames();
    expect(offset(image)).toEqual({ x: 0, y: 0 });
    expect(frames.size).toBe(0);
  });

  it('tracks scrolling during a drag without changing the grab offset', () => {
    reducedMotion = true;
    const [image] = mount();
    pointer(image, 'pointerdown', 150, 170);
    pointer(image, 'pointermove', 250, 270);
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(400);
    window.dispatchEvent(new Event('scroll'));
    expect(offset(image)).toEqual({ x: 100, y: 500 });
    expect(image.getBoundingClientRect().top).toBe(220);
  });

  it('uses the responsive CSS position after a resize instead of retaining a placed position', () => {
    reducedMotion = true;
    const [image] = mount();
    drag(image, 300, 200);
    expect(offset(image)).toEqual({ x: 300, y: 200 });
    bases.set(image, new DOMRect(50, 100, 100, 100));
    resize(1200);
    expect(offset(image)).toEqual({ x: 0, y: 0 });
    expect(image.getBoundingClientRect().left).toBe(50);
    expect(image.getBoundingClientRect().top).toBe(100);
  });

  it('resets below the desktop breakpoint and starts fresh when widened', () => {
    const [image] = mount();
    drag(image, 300, 200);
    advanceFrames(3);
    resize(1080);
    expect(offset(image)).toEqual({ x: 0, y: 0 });
    expect(image.hasAttribute('data-drag-enabled')).toBe(false);
    expect(image.hasAttribute('data-dragging')).toBe(false);
    drag(image, 300, 200);
    advanceFrames();
    expect(offset(image)).toEqual({ x: 0, y: 0 });
    resize(1081);
    expect(image.hasAttribute('data-drag-enabled')).toBe(true);
    expect(offset(image)).toEqual({ x: 0, y: 0 });
  });

  it('never enables dragging on an initially narrow page', () => {
    width = 1080;
    const [image] = mount();
    drag(image, 300, 200);
    advanceFrames();
    expect(offset(image)).toEqual({ x: 0, y: 0 });
    expect(image.hasAttribute('data-drag-enabled')).toBe(false);
  });

  it('does not reposition icons when the reader scrolls normally', () => {
    reducedMotion = true;
    const [image] = mount();
    drag(image, 200, 700);
    window.dispatchEvent(new Event('scroll'));
    expect(offset(image)).toEqual({ x: 200, y: 700 });
  });

  it('removes listeners, pointer capture, and spring work on unmount', () => {
    const [image] = mount();
    pointer(image, 'pointerdown', 150, 170);
    pointer(image, 'pointermove', 400, 400);
    cleanup();
    const stopped = offset(image);
    advanceFrames();
    expect(frames.size).toBe(0);
    expect(image.hasPointerCapture(1)).toBe(false);
    pointer(image, 'pointerdown', 150, 170);
    pointer(image, 'pointermove', 600, 600);
    resize(1200);
    motionQuery.dispatchEvent(Object.assign(new Event('change'), { matches: true }));
    advanceFrames();
    expect(offset(image)).toEqual(stopped);
    expect(frames.size).toBe(0);
  });
});
