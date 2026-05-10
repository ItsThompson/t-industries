import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import TimelineItem from './TimelineItem.svelte';

describe('TimelineItem', () => {
	afterEach(() => {
		cleanup();
	});

	const defaultProps = {
		company: 'Acme Corp',
		role: 'Senior Engineer',
		dateRange: 'Jan 2024 - Present',
		description: 'Built scalable distributed systems.',
		side: 'left' as const
	};

	it('renders the role title', () => {
		const { getByText } = render(TimelineItem, { props: defaultProps });
		expect(getByText('Senior Engineer')).toBeTruthy();
	});

	it('renders the company name', () => {
		const { getByText } = render(TimelineItem, { props: defaultProps });
		expect(getByText('Acme Corp')).toBeTruthy();
	});

	it('renders the date range', () => {
		const { getByText } = render(TimelineItem, { props: defaultProps });
		expect(getByText('Jan 2024 - Present')).toBeTruthy();
	});

	it('renders the description text', () => {
		const { getByText } = render(TimelineItem, { props: defaultProps });
		expect(getByText('Built scalable distributed systems.')).toBeTruthy();
	});

	it('has a scrollable description container', () => {
		const { getByTestId } = render(TimelineItem, { props: defaultProps });
		const descriptionContainer = getByTestId('timeline-card-description');
		expect(descriptionContainer).toBeTruthy();
		expect(descriptionContainer.classList.contains('overflow-y-auto')).toBe(true);
	});

	it('applies right text alignment for left side on desktop', () => {
		const { getByTestId } = render(TimelineItem, { props: { ...defaultProps, side: 'left' } });
		const card = getByTestId('timeline-card');
		expect(card.classList.contains('md:text-right')).toBe(true);
	});

	it('applies left text alignment for right side on desktop', () => {
		const { getByTestId } = render(TimelineItem, { props: { ...defaultProps, side: 'right' } });
		const card = getByTestId('timeline-card');
		expect(card.classList.contains('md:text-left')).toBe(true);
	});
});
