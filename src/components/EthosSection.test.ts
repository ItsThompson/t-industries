import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import EthosSection from './EthosSection.svelte';

describe('EthosSection', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders a section with id="ethos"', () => {
		const { container } = render(EthosSection);
		const section = container.querySelector('section#ethos');
		expect(section).toBeTruthy();
	});

	it('renders SectionHeading with "ETHOS" text', () => {
		const { container } = render(EthosSection);
		const heading = container.querySelector('h2');
		expect(heading).toBeTruthy();
		expect(heading?.textContent).toContain('ETHOS');
	});

	it('wraps content in a Compartment with bg-black for legibility', () => {
		const { container } = render(EthosSection);
		const section = container.querySelector('section#ethos');
		const compartment = section?.querySelector('.bg-black.border');
		expect(compartment).toBeTruthy();
	});

	it('renders all 3 ethos item titles', () => {
		const { container } = render(EthosSection);
		const text = container.textContent ?? '';
		expect(text).toContain('Global Perspective');
		expect(text).toContain('Continuous Learning');
		expect(text).toContain('Impactful Purpose');
	});

	it('renders Global Perspective description', () => {
		const { container } = render(EthosSection);
		const text = container.textContent ?? '';
		expect(text).toContain(
			'The diversity of the world population drives innovation and change'
		);
	});

	it('renders Global Perspective walking the walk text', () => {
		const { container } = render(EthosSection);
		const text = container.textContent ?? '';
		expect(text).toContain('7 cities, 6 countries, 3 continents');
	});

	it('renders Continuous Learning description', () => {
		const { container } = render(EthosSection);
		const text = container.textContent ?? '';
		expect(text).toContain(
			'Innovation is accelerated by standing on the shoulders of giants'
		);
	});

	it('renders Impactful Purpose description', () => {
		const { container } = render(EthosSection);
		const text = container.textContent ?? '';
		expect(text).toContain(
			'Do good and provide value. You only have so much time on this earth.'
		);
	});

	it('renders 3 grid rows for ethos items', () => {
		const { container } = render(EthosSection);
		const gridRows = container.querySelectorAll('.grid.grid-cols-12');
		expect(gridRows.length).toBe(3);
	});
});
