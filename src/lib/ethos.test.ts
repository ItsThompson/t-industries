import { describe, it, expect } from 'vitest';
import { ETHOS_ITEMS, ethosAnchorId } from './ethos';

describe('ethos data', () => {
	it('contains exactly 3 ethos items', () => {
		expect(ETHOS_ITEMS).toHaveLength(3);
	});

	it('first item is Global Perspective', () => {
		expect(ETHOS_ITEMS[0].title).toBe('Global Perspective');
	});

	it('second item is Continuous Learning', () => {
		expect(ETHOS_ITEMS[1].title).toBe('Continuous Learning');
	});

	it('third item is Impactful Purpose', () => {
		expect(ETHOS_ITEMS[2].title).toBe('Impactful Purpose');
	});

	it('each item has a non-empty description', () => {
		for (const item of ETHOS_ITEMS) {
			expect(item.description.length).toBeGreaterThan(0);
		}
	});

	it('each item has a non-empty walkingTheWalk', () => {
		for (const item of ETHOS_ITEMS) {
			expect(item.walkingTheWalk.length).toBeGreaterThan(0);
		}
	});

	it('Global Perspective description matches ethos page content', () => {
		expect(ETHOS_ITEMS[0].description).toContain(
			'The diversity of the world population drives innovation and change'
		);
	});

	it('Global Perspective walkingTheWalk mentions 8 cities and 3 continents', () => {
		expect(ETHOS_ITEMS[0].walkingTheWalk).toContain('8 cities, 3 continents');
	});

	it('gives every item a unique id, so a deep link can name exactly one row', () => {
		const ids = ETHOS_ITEMS.map((item) => item.id);
		expect(new Set(ids).size).toBe(ETHOS_ITEMS.length);
		expect(ids).toContain('continuous-learning');
	});

	it('builds anchor ids that cannot collide with another row', () => {
		const anchors = ETHOS_ITEMS.map((item) => ethosAnchorId(item.id));
		expect(new Set(anchors).size).toBe(ETHOS_ITEMS.length);
		expect(anchors).toContain('ethos-continuous-learning');
	});
});
