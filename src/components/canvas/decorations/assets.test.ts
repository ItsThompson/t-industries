import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/svelte';
import { MarginObjects, OpeningComposition } from './index';

afterEach(cleanup);

describe('decorative assets', () => {
  it('ships exactly the ten referenced mixed-style SVGs within a 12 KB budget', () => {
    const opening = render(OpeningComposition);
    const margins = render(MarginObjects);
    const images = [
      ...opening.container.querySelectorAll('img'),
      ...margins.container.querySelectorAll('img'),
    ];
    const sources = images.map((image) => image.getAttribute('src')!);
    const assets = import.meta.glob<string>('/static/decorations/**/*.svg', {
      eager: true,
      query: '?raw',
      import: 'default',
    });
    const assetSources = Object.keys(assets).map((path) => path.replace('/static', ''));

    expect(sources).toHaveLength(10);
    expect(new Set(sources).size).toBe(10);
    expect([...sources].sort()).toEqual(assetSources.sort());

    let totalBytes = 0;
    for (const source of sources) {
      const asset = assets[`/static${source}`];
      totalBytes += new TextEncoder().encode(asset).byteLength;
      const svg = new DOMParser().parseFromString(asset, 'image/svg+xml');
      expect(svg.querySelector('parsererror')).toBeNull();
      expect(svg.documentElement.getAttribute('viewBox')).toBe('0 0 160 160');
      expect(svg.querySelector('script, foreignObject, image, filter')).toBeNull();
      expect(svg.querySelectorAll('path, circle, ellipse').length).toBeGreaterThan(0);
    }
    expect(totalBytes).toBeLessThan(12_000);
  });
});
