import { describe, it, expect } from 'vitest';
import { ETHOS_ITEMS } from './ethos';

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

	it('Global Perspective walkingTheWalk mentions 7 cities, 6 countries', () => {
		expect(ETHOS_ITEMS[0].walkingTheWalk).toContain('7 cities, 6 countries, 3 continents');
	});
});
