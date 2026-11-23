import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/svelte';
import MarginObjects from './MarginObjects.svelte';

afterEach(cleanup);

describe('MarginObjects', () => {
  it('uses all five remaining preferred drawings in the mobile row order', () => {
    const { container } = render(MarginObjects);
    const images = Array.from(container.querySelectorAll('img'));

    expect(images.map((image) => image.getAttribute('src'))).toEqual([
      '/decorations/skateboard.svg',
      '/decorations/fidget-cube.svg',
      '/decorations/rubiks-cube.svg',
      '/decorations/electric-guitar.svg',
      '/decorations/keyboard.svg',
    ]);
  });

  it('lets the browser defer offscreen decoration without any loading script', () => {
    const { container } = render(MarginObjects);

    for (const image of container.querySelectorAll('img')) {
      expect(image.getAttribute('loading')).toBe('lazy');
      expect(image.getAttribute('fetchpriority')).toBe('low');
      expect(image.getAttribute('decoding')).toBe('async');
      expect(image.getAttribute('width')).toBe('160');
      expect(image.getAttribute('height')).toBe('160');
      expect(image.getAttribute('alt')).toBe('');
      expect(image.getAttribute('draggable')).toBe('false');
      expect(image.closest('[aria-hidden="true"]')).not.toBeNull();
    }
  });
});
