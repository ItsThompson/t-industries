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

	it('renders the Divider with "&ET" label', () => {
		const { container } = render(EthosSection);
		const divider = container.querySelector('[aria-hidden="true"]');
		expect(divider).toBeTruthy();
		expect(divider?.textContent).toContain('&ET');
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

	it('each ethos item title uses col-span-2 on desktop', () => {
		const { container } = render(EthosSection);
		const titles = container.querySelectorAll('h3');
		expect(titles.length).toBe(3);
		for (const title of titles) {
			expect(title.classList.contains('md:col-span-2')).toBe(true);
		}
	});

	it('each ethos item has col-span-12 for mobile stacking', () => {
		const { container } = render(EthosSection);
		const titles = container.querySelectorAll('h3');
		for (const title of titles) {
			expect(title.classList.contains('col-span-12')).toBe(true);
		}
	});

	it('description uses col-span-4 on desktop', () => {
		const { container } = render(EthosSection);
		const gridRows = container.querySelectorAll('.grid.grid-cols-12');
		for (const row of gridRows) {
			const descCol = row.querySelectorAll('.md\\:col-span-4');
			expect(descCol.length).toBe(1);
		}
	});

	it('walking the walk uses col-span-6 on desktop', () => {
		const { container } = render(EthosSection);
		const gridRows = container.querySelectorAll('.grid.grid-cols-12');
		for (const row of gridRows) {
			const proofCol = row.querySelectorAll('.md\\:col-span-6');
			expect(proofCol.length).toBe(1);
		}
	});

	it('text uses minimum text-xs size for legibility', () => {
		const { container } = render(EthosSection);
		const paragraphs = container.querySelectorAll('p');
		for (const p of paragraphs) {
			expect(p.classList.contains('text-xs')).toBe(true);
		}
	});
});
