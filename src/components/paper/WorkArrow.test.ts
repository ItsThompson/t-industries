import { describe, it, expect, afterEach, vi } from 'vitest';
import { fireEvent } from '@testing-library/svelte';
import WorkArrow from './WorkArrow.svelte';
import { FADE_OUT_MS } from '$lib/paper-arrow';
import { paperBandColor } from '$lib/paper';

type ArrowRequest = Parameters<InstanceType<typeof WorkArrow>['tryDraw']>[0];

// jsdom reports zero for every rect, so the geometry is stubbed to a realistic
// wide layout: phrase at x=600, entry edge at x=360, layer spanning the page.
const TRIGGER_RECT = new DOMRect(600, 200, 120, 24);
const ENTRY_RECT = new DOMRect(360, 900, 720, 140);
const LAYER_RECT = new DOMRect(0, 0, 1280, 2400);
const LIGHT_ACCENT = '#ABDBFA';

let instance: WorkArrow | null = null;
let target: HTMLElement | null = null;
let rafCallback: ((now: number) => void) | null = null;

function mount(): WorkArrow {
  target = document.createElement('div');
  document.body.appendChild(target);
  instance = new WorkArrow({ target });
  return instance;
}

function stubEnvironment(innerWidth: number, reducedMotion: boolean): void {
  Object.defineProperty(window, 'innerWidth', { value: innerWidth, configurable: true });
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({
      matches: reducedMotion,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  );
  rafCallback = null;
  vi.stubGlobal(
    'requestAnimationFrame',
    vi.fn((callback: (now: number) => void) => {
      rafCallback = callback;
      return 1;
    }),
  );
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
}

function stubGeometry(): { trigger: HTMLElement; entry: HTMLElement } {
  const svg = target!.querySelector('svg');
  if (!svg) throw new Error('No arrow layer rendered');

  svg.getBoundingClientRect = () => LAYER_RECT;

  const trigger = document.createElement('a');
  trigger.getClientRects = () => [TRIGGER_RECT] as unknown as DOMRectList;

  const entry = document.createElement('article');
  entry.getBoundingClientRect = () => ENTRY_RECT;

  return { trigger, entry };
}

function request(
  trigger: HTMLElement,
  entry: HTMLElement,
  overrides: Partial<ArrowRequest> = {},
): ArrowRequest {
  return {
    trigger,
    entry,
    accent: LIGHT_ACCENT,
    pointer: { x: 640, y: 212 },
    keyboard: false,
    ...overrides,
  };
}

function strokePath(): SVGPathElement {
  return target!.querySelectorAll('path')[0];
}

function headPath(): SVGPathElement {
  return target!.querySelectorAll('path')[1];
}

function group(): SVGGElement {
  return target!.querySelector('g')!;
}

/** Lets the one-task-delayed dismissal listener attach. */
async function flushArmTimer(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 1));
}

function finishFade(): void {
  if (!rafCallback) throw new Error('No animation frame scheduled');
  rafCallback(performance.now() + FADE_OUT_MS + 1);
}

describe('WorkArrow', () => {
  afterEach(() => {
    instance?.$destroy();
    target?.remove();
    instance = null;
    target = null;
    Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true });
    vi.unstubAllGlobals();
  });

  it('refuses to draw below the wide breakpoint', () => {
    stubEnvironment(900, false);
    const component = mount();
    const { trigger, entry } = stubGeometry();

    expect(component.tryDraw(request(trigger, entry))).toBe(false);
    expect(strokePath().getAttribute('d') ?? '').toBe('');
    expect(group().getAttribute('opacity')).toBe('0');
  });

  it('refuses to draw under reduced motion', () => {
    stubEnvironment(1280, true);
    const component = mount();
    const { trigger, entry } = stubGeometry();

    expect(component.tryDraw(request(trigger, entry))).toBe(false);
    expect(strokePath().getAttribute('d') ?? '').toBe('');
  });

  it('draws a path with the dash set for the draw-on', () => {
    stubEnvironment(1280, false);
    const component = mount();
    const { trigger, entry } = stubGeometry();

    expect(component.tryDraw(request(trigger, entry))).toBe(true);

    const stroke = strokePath();
    expect(stroke.getAttribute('d')?.startsWith('M')).toBe(true);
    expect(Number(stroke.style.strokeDasharray)).toBeGreaterThan(0);
    // The full length starts hidden, so frame zero draws nothing.
    expect(stroke.style.strokeDashoffset).toBe(stroke.style.strokeDasharray);
    expect(headPath().getAttribute('d')?.startsWith('M')).toBe(true);
    expect(group().getAttribute('opacity')).toBe('1');
  });

  it('strokes in the darkened accent, never the raw accent', () => {
    stubEnvironment(1280, false);
    const component = mount();
    const { trigger, entry } = stubGeometry();

    component.tryDraw(request(trigger, entry));

    const darkened = paperBandColor(LIGHT_ACCENT);
    expect(darkened).not.toBe(LIGHT_ACCENT);
    expect(strokePath().getAttribute('stroke')).toBe(darkened);
    expect(headPath().getAttribute('fill')).toBe(darkened);
  });

  it('clears the path after the fade when Escape is pressed', async () => {
    stubEnvironment(1280, false);
    const component = mount();
    const { trigger, entry } = stubGeometry();

    component.tryDraw(request(trigger, entry));
    await flushArmTimer();

    fireEvent.keyDown(document, { key: 'Escape' });
    finishFade();

    expect(strokePath().getAttribute('d') ?? '').toBe('');
    expect(headPath().getAttribute('d') ?? '').toBe('');
    expect(group().getAttribute('opacity')).toBe('0');
  });

  it('returns focus to the phrase when a keyboard activation is escaped', async () => {
    stubEnvironment(1280, false);
    const component = mount();
    const { trigger, entry } = stubGeometry();
    const focus = vi.spyOn(trigger, 'focus');

    component.tryDraw(request(trigger, entry, { pointer: null, keyboard: true }));
    await flushArmTimer();

    fireEvent.keyDown(document, { key: 'Escape' });
    finishFade();

    expect(focus).toHaveBeenCalledTimes(1);
  });

  it('dismisses on resize, since the measured path no longer fits', async () => {
    stubEnvironment(1280, false);
    const component = mount();
    const { trigger, entry } = stubGeometry();

    component.tryDraw(request(trigger, entry));
    await flushArmTimer();

    window.dispatchEvent(new Event('resize'));
    finishFade();

    expect(strokePath().getAttribute('d') ?? '').toBe('');
  });

  it('replaces the arrow on a second draw, which the first dismissal listener cannot kill', async () => {
    stubEnvironment(1280, false);
    const component = mount();
    const first = stubGeometry();
    const second = stubGeometry();

    component.tryDraw(request(first.trigger, first.entry));
    await flushArmTimer();

    component.tryDraw(request(second.trigger, second.entry));
    // The click that started the second arrow is still bubbling: the old
    // document listener must already be gone.
    document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await flushArmTimer();

    expect(strokePath().getAttribute('d')?.startsWith('M')).toBe(true);
    expect(group().getAttribute('opacity')).toBe('1');

    // A later click dismisses the replacement.
    document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    finishFade();

    expect(strokePath().getAttribute('d') ?? '').toBe('');
  });

  it('dismisses on a plain click anywhere on the document', async () => {
    stubEnvironment(1280, false);
    const component = mount();
    const { trigger, entry } = stubGeometry();

    component.tryDraw(request(trigger, entry));
    await flushArmTimer();
    document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    finishFade();

    expect(strokePath().getAttribute('d') ?? '').toBe('');
  });
});
