import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import Timeline from './Timeline.svelte';
import type { Experience } from '$lib/experiences';

const mockExperiences: Experience[] = [
	{
		company: 'Acme Corp',
		role: 'Senior Engineer',
		startDate: 'Jan 2024',
		endDate: 'Present',
		description: 'Built distributed systems at scale.'
	},
	{
		company: 'StartupCo',
		role: 'Full-Stack Developer',
		startDate: 'Mar 2022',
		endDate: 'Dec 2023',
		description: 'Shipped product features to 10k users.'
	},
	{
		company: 'University Lab',
		role: 'Research Assistant',
		startDate: 'Sep 2021',
		endDate: 'Feb 2022',
		description: 'Published 2 papers on machine learning.'
	}
];

describe('Timeline', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders the correct number of timeline entries', () => {
		const { getAllByTestId } = render(Timeline, { props: { experiences: mockExperiences } });
		const entries = getAllByTestId('timeline-entry');
		expect(entries).toHaveLength(3);
	});

	it('renders all company names', () => {
		const { getAllByText } = render(Timeline, { props: { experiences: mockExperiences } });
		mockExperiences.forEach((experience) => {
			const elements = getAllByText(experience.company);
			expect(elements.length).toBeGreaterThanOrEqual(1);
		});
	});

	it('renders the vertical timeline line', () => {
		const { getByTestId } = render(Timeline, { props: { experiences: mockExperiences } });
		expect(getByTestId('timeline-line')).toBeTruthy();
	});

	it('renders dot markers for each entry', () => {
		const { getAllByTestId } = render(Timeline, { props: { experiences: mockExperiences } });
		const desktopDots = getAllByTestId('timeline-dot');
		const mobileDots = getAllByTestId('timeline-dot-mobile');
		expect(desktopDots).toHaveLength(3);
		expect(mobileDots).toHaveLength(3);
	});

	it('renders with a single experience entry', () => {
		const subset = mockExperiences.slice(0, 1);
		const { getAllByTestId } = render(Timeline, { props: { experiences: subset } });
		expect(getAllByTestId('timeline-entry')).toHaveLength(1);
		expect(getAllByTestId('timeline-dot')).toHaveLength(1);
	});

	it('applies alternating side logic to desktop cards', () => {
		const { getAllByTestId } = render(Timeline, { props: { experiences: mockExperiences } });
		const entries = getAllByTestId('timeline-entry');

		entries.forEach((entry, index) => {
			const leftCell = entry.querySelector('[data-testid="timeline-desktop-left"]');
			const rightCell = entry.querySelector('[data-testid="timeline-desktop-right"]');

			if (index % 2 === 0) {
				// Even: left card has content, right is invisible
				expect(leftCell?.classList.contains('invisible')).toBe(false);
				expect(rightCell?.classList.contains('invisible')).toBe(true);
			} else {
				// Odd: left is invisible, right card has content
				expect(leftCell?.classList.contains('invisible')).toBe(true);
				expect(rightCell?.classList.contains('invisible')).toBe(false);
			}
		});
	});
});
