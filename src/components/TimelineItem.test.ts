import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import TimelineItem from './TimelineItem.svelte';

describe('TimelineItem', () => {
	afterEach(() => {
		cleanup();
	});

	const defaultProps = {
		company: 'Amazon (Veeqo)',
		role: 'Front-End Engineer',
		dateRange: 'Sep 2025 - Present',
		description: 'Built production software at scale.',
		side: 'left' as const
	};

	it('renders the role title', () => {
		const { getByText } = render(TimelineItem, { props: defaultProps });
		expect(getByText('Front-End Engineer')).toBeTruthy();
	});

	it('renders the company name', () => {
		const { getByText } = render(TimelineItem, { props: defaultProps });
		expect(getByText('Amazon (Veeqo)')).toBeTruthy();
	});

	it('renders the date range', () => {
		const { getByText } = render(TimelineItem, { props: defaultProps });
		expect(getByText('Sep 2025 - Present')).toBeTruthy();
	});

	it('renders the description text', () => {
		const { getByText } = render(TimelineItem, { props: defaultProps });
		expect(getByText('Built production software at scale.')).toBeTruthy();
	});

	it('has overflow-y-auto on the description container', () => {
		const { container } = render(TimelineItem, { props: defaultProps });
		const overflowEl = container.querySelector('.overflow-y-auto');
		expect(overflowEl).not.toBeNull();
	});

	it('applies right text alignment for left side on desktop', () => {
		const { container } = render(TimelineItem, { props: { ...defaultProps, side: 'left' } });
		const card = container.firstElementChild;
		expect(card?.classList.contains('md:text-right')).toBe(true);
	});

	it('applies left text alignment for right side on desktop', () => {
		const { container } = render(TimelineItem, { props: { ...defaultProps, side: 'right' } });
		const card = container.firstElementChild;
		expect(card?.classList.contains('md:text-left')).toBe(true);
	});

	it('uses bordered card styling consistent with site aesthetic', () => {
		const { container } = render(TimelineItem, { props: defaultProps });
		const card = container.firstElementChild;
		expect(card?.classList.contains('border')).toBe(true);
		expect(card?.classList.contains('bg-black')).toBe(true);
	});

	it('has a fixed height for visual uniformity', () => {
		const { container } = render(TimelineItem, { props: defaultProps });
		const card = container.firstElementChild;
		expect(card?.classList.contains('h-48')).toBe(true);
	});
});
