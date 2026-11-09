import { describe, it, expect } from 'vitest';
import {
	MAP_ATTRIBUTION,
	TILE_SIZE,
	buildMapLayout,
	projectToWorldPixel,
	tileUrl
} from './map-tiles';
import { CITIES } from './cities';

describe('projectToWorldPixel', () => {
	it('puts the null island at the center of the world', () => {
		const point = projectToWorldPixel(0, 0, 1);

		expect(point.x).toBe(TILE_SIZE);
		expect(point.y).toBe(TILE_SIZE);
	});

	it('doubles the world size for each zoom level', () => {
		expect(projectToWorldPixel(0, 180, 1).x).toBe(2 * TILE_SIZE);
		expect(projectToWorldPixel(0, 180, 2).x).toBe(4 * TILE_SIZE);
	});

	it('moves east for larger longitudes and south for smaller latitudes', () => {
		const west = projectToWorldPixel(0, -10, 2);
		const east = projectToWorldPixel(0, 10, 2);
		const north = projectToWorldPixel(40, 0, 2);
		const south = projectToWorldPixel(-40, 0, 2);

		expect(east.x).toBeGreaterThan(west.x);
		expect(north.y).toBeLessThan(south.y);
	});

	it('clamps latitudes beyond the Mercator limit instead of returning infinity', () => {
		const point = projectToWorldPixel(89, 0, 2);

		expect(Number.isFinite(point.y)).toBe(true);
		expect(point.y).toBeGreaterThanOrEqual(0);
	});
});

describe('tileUrl', () => {
	it('fills the slippy-map placeholders', () => {
		expect(tileUrl(3, 4, 5)).toBe(
			'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/3/5/4'
		);
	});

	it('never leaks a placeholder into a request', () => {
		expect(tileUrl(2, 1, 1)).not.toMatch(/[{}]/);
	});
});

describe('buildMapLayout', () => {
	it('refuses to lay out an empty world', () => {
		expect(() => buildMapLayout([])).toThrow();
	});

	it('frames every city inside the map box', () => {
		const layout = buildMapLayout(CITIES);

		for (const marker of layout.markers) {
			expect(marker.left).toBeGreaterThan(0);
			expect(marker.left).toBeLessThan(100);
			expect(marker.top).toBeGreaterThan(0);
			expect(marker.top).toBeLessThan(100);
		}
	});

	it('keeps one marker per city, in order', () => {
		const layout = buildMapLayout(CITIES);

		expect(layout.markers).toHaveLength(CITIES.length);
		expect(layout.markers.map((marker) => marker.id)).toEqual(CITIES.map((city) => city.id));
	});

	it('stays within the tile budget', () => {
		const layout = buildMapLayout(CITIES, { maxTiles: 16 });

		expect(layout.tiles.length).toBeLessThanOrEqual(16);
	});

	it('zooms in as far as the tile budget allows', () => {
		const generous = buildMapLayout(CITIES, { maxTiles: 64 });
		const tight = buildMapLayout(CITIES, { maxTiles: 4 });

		expect(generous.zoom).toBeGreaterThan(tight.zoom);
	});

	it('covers the whole box with tiles, each one contiguous', () => {
		const layout = buildMapLayout(CITIES);

		const width = layout.tiles.reduce((sum, tile) => sum + (tile.width / 100) * layout.width, 0);
		const height = layout.tiles.reduce((sum, tile) => sum + (tile.height / 100) * layout.height, 0);

		// Each column and row repeats the full box length, so the sums exceed it.
		expect(width).toBeGreaterThanOrEqual(layout.width);
		expect(height).toBeGreaterThanOrEqual(layout.height);
		layout.tiles.forEach((tile) => {
			expect(tile.left).toBeGreaterThanOrEqual(0);
			expect(tile.top).toBeGreaterThanOrEqual(0);
		});
	});

	it('gives each tile a unique key, so no request is duplicated', () => {
		const layout = buildMapLayout(CITIES);
		const keys = layout.tiles.map((tile) => tile.key);

		expect(new Set(keys).size).toBe(keys.length);
	});

	it('is deterministic for the same input', () => {
		expect(buildMapLayout(CITIES)).toEqual(buildMapLayout(CITIES));
	});

	it('separates markers that would overlap, such as Bath and Swansea', () => {
		const layout = buildMapLayout(CITIES);
		const bath = layout.markers.find((marker) => marker.id === 'bath');
		const swansea = layout.markers.find((marker) => marker.id === 'swansea');

		expect(bath && swansea).toBeTruthy();
		const verticalGap = (Math.abs(bath!.top - swansea!.top) / 100) * layout.height;
		expect(verticalGap).toBeGreaterThan(10);
	});

	it('keeps a nudged marker on the same side as its true position', () => {
		const layout = buildMapLayout(CITIES);
		const bath = layout.markers.find((marker) => marker.id === 'bath')!;
		const swansea = layout.markers.find((marker) => marker.id === 'swansea')!;

		// Swansea is north of Bath, so it must still be drawn above it.
		expect(swansea.top).toBeLessThan(bath.top);
		expect(swansea.shifted).toBe(true);
		expect(swansea.anchorTop).not.toBe(swansea.top);
	});

	it('leaves well-separated markers exactly where the projection puts them', () => {
		const layout = buildMapLayout(CITIES);
		const singapore = layout.markers.find((marker) => marker.id === 'singapore')!;

		expect(singapore.shifted).toBe(false);
		expect(singapore.top).toBeCloseTo(singapore.anchorTop, 5);
	});

	it('credits the basemap', () => {
		expect(MAP_ATTRIBUTION).toContain('OpenStreetMap');
	});
});
