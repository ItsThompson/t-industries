import { describe, it, expect } from 'vitest';
import { BIO_LINKS } from './bio-links';
import { ACCENTS } from './accents';

const LINKS = Object.values(BIO_LINKS);

describe('bio links', () => {
	it('gives every link a unique target, so no two notes share an id', () => {
		const targets = LINKS.map((link) => link.target);
		expect(new Set(targets).size).toBe(LINKS.length);
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

	it('uses each organisation brand colour as the accent', () => {
		expect(BIO_LINKS.amazon.accent).toBe(ACCENTS.amazon);
		expect(BIO_LINKS.msd.accent).toBe(ACCENTS.msd);
		expect(BIO_LINKS.criisp.accent).toBe(ACCENTS.criisp);
	});

	it('gives every link a label and a note worth hovering for', () => {
		LINKS.forEach((link) => {
			expect(link.label.length).toBeGreaterThan(0);
			expect(link.note.length).toBeGreaterThan(40);
		});
	});
});
