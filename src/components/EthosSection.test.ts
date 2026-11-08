import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import { tick } from 'svelte';
import EthosSection from './EthosSection.svelte';
import { resetPageRoute, setPageUrl } from '$lib/__mocks__/app-stores';

function nextFrame(): Promise<void> {
	return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

describe('EthosSection', () => {
	beforeEach(() => {
		resetPageRoute();
	});

	afterEach(async () => {
		// Let a deferred reveal finish before the document is torn down, so it
		// cannot scroll an element belonging to the next test.
		await nextFrame();
		cleanup();
		vi.restoreAllMocks();
		delete (Element.prototype as unknown as { scrollIntoView?: unknown }).scrollIntoView;
		resetPageRoute();
	});

	it('renders a section with id="ethos"', () => {
		const { container } = render(EthosSection);
		const section = container.querySelector('section#ethos');
		expect(section).toBeTruthy();
	});

	it('renders SectionHeading with "ETHOS" text', () => {
		const { container } = render(EthosSection);
		const heading = container.querySelector('h1');
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

	describe('highlighted by a bio link', () => {
		function stubScrollIntoView(): ReturnType<typeof vi.fn> {
			const scrollIntoView = vi.fn();
			(Element.prototype as unknown as { scrollIntoView: unknown }).scrollIntoView =
				scrollIntoView;
			return scrollIntoView;
		}

		function highlightedRows(container: HTMLElement): Element[] {
			return Array.from(container.querySelectorAll('[data-highlighted="true"]'));
		}

		it('marks nothing when no target is requested', () => {
			const { container } = render(EthosSection);
			expect(highlightedRows(container)).toHaveLength(0);
		});

		it('marks only the requested row', () => {
			setPageUrl('/ethos', '?highlight=continuous-learning');

			const { container } = render(EthosSection);
			const rows = highlightedRows(container);

			expect(rows).toHaveLength(1);
			expect(rows[0].getAttribute('data-ethos-id')).toBe('continuous-learning');
		});

		it('gives the requested row an anchor another route can scroll to', () => {
			setPageUrl('/ethos', '?highlight=continuous-learning');

			const { container } = render(EthosSection);

			expect(container.querySelector('#ethos-continuous-learning')).toBeTruthy();
		});

		it('centers the requested row in the scroll region', async () => {
			const scrollIntoView = stubScrollIntoView();
			setPageUrl('/ethos', '?highlight=continuous-learning');

			render(EthosSection);
			await nextFrame();

			expect(scrollIntoView).toHaveBeenCalledWith(
				expect.objectContaining({ block: 'center' })
			);
			const scrolledElement = scrollIntoView.mock.instances[0] as unknown as HTMLElement;
			expect(scrolledElement.id).toBe('ethos-continuous-learning');
		});

		it('marks the row with the ethos accent', () => {
			setPageUrl('/ethos', '?highlight=continuous-learning');

			const { container } = render(EthosSection);
			const row = container.querySelector('[data-ethos-id="continuous-learning"]');

			expect(row?.getAttribute('style')).toContain('border-color: rgb(255, 99, 99)');
		});

		it('ignores a target that names no row', async () => {
			const scrollIntoView = stubScrollIntoView();
			setPageUrl('/ethos', '?highlight=does-not-exist');

			const { container } = render(EthosSection);
			await nextFrame();

			expect(highlightedRows(container)).toHaveLength(0);
			expect(scrollIntoView).not.toHaveBeenCalled();
		});

		it('drops the highlight when the query param goes away', async () => {
			setPageUrl('/ethos', '?highlight=continuous-learning');

			const { container } = render(EthosSection);
			expect(highlightedRows(container)).toHaveLength(1);

			setPageUrl('/ethos');
			await tick();

			expect(highlightedRows(container)).toHaveLength(0);
		});
	});
});
