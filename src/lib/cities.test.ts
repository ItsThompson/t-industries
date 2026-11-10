import { describe, it, expect } from 'vitest';
import { CITIES, CITY_COUNT, citiesByContinent, citiesNote, continentCount } from './cities';
import { ETHOS_ITEMS } from './ethos';

describe('cities', () => {
	it('lists the 8 places the bio claims', () => {
		expect(CITIES).toHaveLength(8);
		expect(CITY_COUNT).toBe(8);
	});

	it('spans 3 continents, so the bio claim stays true', () => {
		expect(continentCount(CITIES)).toBe(3);
		expect(new Set(CITIES.map((city) => city.continent))).toEqual(
			new Set(['Asia', 'Europe', 'North America'])
		);
	});

	it('names each place the bio is talking about', () => {
		const names = CITIES.map((city) => city.name);
		expect(names).toEqual([
			'Hong Kong',
			'Taipei',
			'Chengdu',
			'Shanghai',
			'Livingston',
			'Singapore',
			'Bath',
			'Swansea'
		]);
	});

	it('gives every place a unique id, used as its marker key', () => {
		const ids = CITIES.map((city) => city.id);
		expect(new Set(ids).size).toBe(CITIES.length);
	});

	it('keeps every coordinate on the globe', () => {
		CITIES.forEach((city) => {
			expect(city.latitude).toBeGreaterThanOrEqual(-85);
			expect(city.latitude).toBeLessThanOrEqual(85);
			expect(city.longitude).toBeGreaterThanOrEqual(-180);
			expect(city.longitude).toBeLessThanOrEqual(180);
		});
	});

	it('labels every place with a region for the legend', () => {
		CITIES.forEach((city) => {
			expect(city.region.length).toBeGreaterThan(0);
		});
	});

	it('groups places by continent without losing any', () => {
		const groups = citiesByContinent(CITIES);
		const grouped = groups.flatMap((group) => group.cities);

		expect(groups).toHaveLength(3);
		expect(grouped).toHaveLength(CITIES.length);
		expect(groups[0].continent).toBe('Asia');
		expect(groups[0].cities).toHaveLength(5);
		expect(groups[0].cities[0].id).toBe('hong-kong');
	});

	it('keeps the order of the city list inside each continent', () => {
		const europe = citiesByContinent(CITIES).find((group) => group.continent === 'Europe');

		expect(europe?.cities.map((city) => city.name)).toEqual(['Bath', 'Swansea']);
	});

	it('agrees with the count in the ethos page copy', () => {
		expect(ETHOS_ITEMS[0].walkingTheWalk).toContain(
			`${CITY_COUNT} cities, ${continentCount(CITIES)} continents`
		);
	});
});

describe('citiesNote', () => {
	it('names every place the bio counts', () => {
		const note = citiesNote();

		CITIES.forEach((city) => expect(note).toContain(city.name));
	});

	it('names all 3 continents', () => {
		const note = citiesNote();

		citiesByContinent().forEach((group) => expect(note).toContain(group.continent));
		expect(note).toContain('Asia');
		expect(note).toContain('Europe');
		expect(note).toContain('North America');
	});

	it('groups the places under the continent they belong to', () => {
		expect(citiesNote()).toContain('Europe: Bath, Swansea.');
	});

	it('reads as sentences, so the note needs no separate punctuation', () => {
		expect(citiesNote()).not.toMatch(/\s{2,}/);
		expect(citiesNote().endsWith('.')).toBe(true);
	});
});
