import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { overlapsProtectedContent } from './overlaps-protected-content';

let root: HTMLDivElement;
let page: HTMLDivElement;
const SIZE = { width: 100, height: 100 };

function obstacle(tag = 'p', rect = new DOMRect(400, 320, 300, 100)): HTMLElement {
  const element = document.createElement(tag);
  element.textContent = 'Protected content';
  page.appendChild(element);
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(rect);
  return element;
}

beforeEach(() => {
  root = document.createElement('div');
  page = document.createElement('div');
  root.appendChild(page);
  document.body.appendChild(root);
});

afterEach(() => {
  root.remove();
  vi.restoreAllMocks();
});

describe('overlapsProtectedContent', () => {
  it.each(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'button'])(
    'protects the entire %s block even when its text is short',
    (tag) => {
      obstacle(tag);
      expect(overlapsProtectedContent(page, { x: 600, y: 350 }, SIZE)).toBe(true);
    },
  );

  it.each(['button', 'link'])('protects custom controls with role=%s', (role) => {
    obstacle('span').setAttribute('role', role);
    expect(overlapsProtectedContent(page, { x: 400, y: 320 }, SIZE)).toBe(true);
  });

  it('requires overlap on both axes', () => {
    obstacle();
    expect(overlapsProtectedContent(page, { x: 100, y: 320 }, SIZE)).toBe(false);
    expect(overlapsProtectedContent(page, { x: 400, y: 120 }, SIZE)).toBe(false);
  });

  it('accepts eight pixels of clearance but rejects any smaller gap on every side', () => {
    obstacle();
    expect(overlapsProtectedContent(page, { x: 292, y: 320 }, SIZE)).toBe(false);
    expect(overlapsProtectedContent(page, { x: 293, y: 320 }, SIZE)).toBe(true);
    expect(overlapsProtectedContent(page, { x: 708, y: 320 }, SIZE)).toBe(false);
    expect(overlapsProtectedContent(page, { x: 707, y: 320 }, SIZE)).toBe(true);
    expect(overlapsProtectedContent(page, { x: 400, y: 212 }, SIZE)).toBe(false);
    expect(overlapsProtectedContent(page, { x: 400, y: 213 }, SIZE)).toBe(true);
    expect(overlapsProtectedContent(page, { x: 400, y: 428 }, SIZE)).toBe(false);
    expect(overlapsProtectedContent(page, { x: 400, y: 427 }, SIZE)).toBe(true);
  });

  it('converts viewport rectangles to document coordinates', () => {
    vi.spyOn(window, 'scrollX', 'get').mockReturnValue(200);
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(600);
    obstacle('p', new DOMRect(200, 400, 300, 100));
    expect(overlapsProtectedContent(page, { x: 400, y: 1000 }, SIZE)).toBe(true);
    expect(overlapsProtectedContent(page, { x: 200, y: 400 }, SIZE)).toBe(false);
  });

  it('ignores controls outside the canvas page', () => {
    const element = obstacle('a');
    root.appendChild(element);
    expect(overlapsProtectedContent(page, { x: 400, y: 320 }, SIZE)).toBe(false);
  });

  it('ignores empty rectangles', () => {
    obstacle('p', new DOMRect(400, 320, 0, 100));
    obstacle('p', new DOMRect(400, 320, 300, 0));
    expect(overlapsProtectedContent(page, { x: 400, y: 320 }, SIZE)).toBe(false);
  });

  it('ignores content hidden by an ancestor or CSS visibility', () => {
    page.hidden = true;
    obstacle();
    expect(overlapsProtectedContent(page, { x: 400, y: 320 }, SIZE)).toBe(false);
    page.hidden = false;
    page.style.visibility = 'hidden';
    expect(overlapsProtectedContent(page, { x: 400, y: 320 }, SIZE)).toBe(false);
  });

  it('does not treat other decorations or empty wrappers as text', () => {
    obstacle('img');
    obstacle('div');
    expect(overlapsProtectedContent(page, { x: 400, y: 320 }, SIZE)).toBe(false);
  });
});
