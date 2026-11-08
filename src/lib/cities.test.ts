import { describe, it, expect } from 'vitest';
import { CITIES, CITY_COUNT, citiesByContinent, continentCount, numberedCities } from './cities';
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

	it('numbers the places from 1 in list order, matching the markers', () => {
		const numbered = numberedCities(CITIES);

		expect(numbered.map((entry) => entry.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
		expect(numbered[0].city.id).toBe('hong-kong');
		expect(numbered[7].city.id).toBe('swansea');
	});

	it('groups places by continent without losing any', () => {
		const groups = citiesByContinent(CITIES);
		const grouped = groups.flatMap((group) => group.entries);

		expect(groups).toHaveLength(3);
		expect(grouped).toHaveLength(CITIES.length);
		expect(groups[0].continent).toBe('Asia');
		expect(groups[0].entries).toHaveLength(5);
	});

	it('agrees with the count in the ethos page copy', () => {
		expect(ETHOS_ITEMS[0].walkingTheWalk).toContain(
			`${CITY_COUNT} cities, 6 countries, ${continentCount(CITIES)} continents`
		);
	});
});
