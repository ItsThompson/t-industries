import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/svelte';
import OpeningComposition from './OpeningComposition.svelte';

afterEach(cleanup);

describe('OpeningComposition', () => {
  it('uses the five preferred drawings around the introduction', () => {
    const { container } = render(OpeningComposition);
    const images = Array.from(container.querySelectorAll('img'));

    expect(images.map((image) => image.getAttribute('src'))).toEqual([
      '/decorations/macbook.svg',
      '/decorations/dumbbell.svg',
      '/decorations/beagle.svg',
      '/decorations/brain.svg',
      '/decorations/headphones.svg',
    ]);
  });

  it('loads the opening without waiting for JavaScript or competing at high priority', () => {
    const { container } = render(OpeningComposition);

    for (const image of container.querySelectorAll('img')) {
      expect(image.getAttribute('loading')).toBe('eager');
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
