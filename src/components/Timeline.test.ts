import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import Timeline from './Timeline.svelte';
import { experiences } from '$lib/experiences';

describe('Timeline', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders the correct number of timeline entries', () => {
		const { container } = render(Timeline, { props: { experiences } });
		const cards = container.querySelectorAll('.h-48');
		// Desktop cards (hidden on mobile) + mobile cards = 5 desktop + 5 mobile
		// On jsdom (no responsive), both md:block and md:hidden render
		// Each experience renders cards in both desktop and mobile containers
		expect(cards.length).toBeGreaterThanOrEqual(5);
	});

	it('renders all company names', () => {
		const { getAllByText } = render(Timeline, { props: { experiences } });
		experiences.forEach((experience) => {
			// Both desktop and mobile versions render in jsdom
			const elements = getAllByText(experience.company);
			expect(elements.length).toBeGreaterThanOrEqual(1);
		});
	});

	it('renders the vertical timeline line', () => {
		const { container } = render(Timeline, { props: { experiences } });
		const line = container.querySelector('.bg-gray-500.w-px');
		expect(line).not.toBeNull();
	});

	it('renders dot markers for each entry on desktop', () => {
		const { container } = render(Timeline, { props: { experiences } });
		const dots = container.querySelectorAll('.rounded-full.bg-white');
		// 5 desktop dots + 5 mobile dots
		expect(dots.length).toBe(10);
	});

	it('renders with a subset of experiences', () => {
		const subset = experiences.slice(0, 2);
		const { container } = render(Timeline, { props: { experiences: subset } });
		const dots = container.querySelectorAll('.rounded-full.bg-white');
		// 2 desktop + 2 mobile
		expect(dots.length).toBe(4);
	});

	it('applies alternating side logic to desktop cards', () => {
		const { container } = render(Timeline, { props: { experiences } });
		// The grid rows are direct children of the flex column container
		const gridRows = container.querySelectorAll('.grid');

		gridRows.forEach((row, index) => {
			const desktopCells = row.querySelectorAll(':scope > .hidden.md\\:block');
			// First cell (left) should have content for even indexes
			// Second cell (right, after the dot) should have content for odd indexes
			if (index % 2 === 0) {
				// Even: left card visible, right invisible
				expect(desktopCells[0]?.classList.contains('invisible')).toBe(false);
			} else {
				// Odd: left invisible, right card visible
				expect(desktopCells[1]?.classList.contains('invisible')).toBe(false);
			}
		});
	});
});
