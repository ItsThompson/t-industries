import { describe, it, expect } from 'vitest';
import { BIO_LINKS, BIO_PLACES_ACTION } from './bio-links';
import { ACCENTS } from './accents';
import { CITY_COUNT } from './cities';

const LINKS = Object.values(BIO_LINKS);
const ACTIONS = [...LINKS, BIO_PLACES_ACTION];

describe('bio links', () => {
	it('gives every link a unique target, so no two notes share an id', () => {
		const targets = ACTIONS.map((action) => action.target);
		expect(new Set(targets).size).toBe(ACTIONS.length);
	});

	it('points every link at the target it names', () => {
		LINKS.forEach((link) => {
			expect(link.href).toContain(`highlight=${link.target}`);
		});
	});

	it('sends the experience links to the experience route', () => {
		expect(BIO_LINKS.amazon.href).toBe('/experience?highlight=amazon');
		expect(BIO_LINKS.msd.href).toBe('/experience?highlight=msd');
		expect(BIO_LINKS.criisp.href).toBe('/experience?highlight=criisp');
	});

	it('sends the first-principles link to the continuous learning row', () => {
		expect(BIO_LINKS.continuousLearning.href).toBe('/ethos?highlight=continuous-learning');
	});

	it('uses each organization brand color as the accent', () => {
		expect(BIO_LINKS.amazon.accent).toBe(ACCENTS.amazon);
		expect(BIO_LINKS.msd.accent).toBe(ACCENTS.msd);
		expect(BIO_LINKS.criisp.accent).toBe(ACCENTS.criisp);
	});

	it('gives every link a label and a note worth hovering for', () => {
		ACTIONS.forEach((action) => {
			expect(action.label.length).toBeGreaterThan(0);
			expect(action.note.length).toBeGreaterThan(40);
		});
	});

	describe('places map action', () => {
		it('has no destination, because it opens the map in place', () => {
			expect('href' in BIO_PLACES_ACTION).toBe(false);
		});

		it('uses the ethos accent, matching the other in-page action', () => {
			expect(BIO_PLACES_ACTION.accent).toBe(ACCENTS.ethos);
		});

		it('names the counts the map will show', () => {
			expect(BIO_PLACES_ACTION.note).toContain(`${CITY_COUNT} cities`);
			expect(BIO_PLACES_ACTION.label).toContain(`${CITY_COUNT}`);
			expect(BIO_PLACES_ACTION.note).toContain('Asia');
			expect(BIO_PLACES_ACTION.note).toContain('Europe');
			expect(BIO_PLACES_ACTION.note).toContain('North America');
		});
	});
});
