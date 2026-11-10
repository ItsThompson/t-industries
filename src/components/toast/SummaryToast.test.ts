import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/svelte';
import tape from '../../../static/tape.svg?raw';
import { THEME_COLORS } from '$lib/theme';
import SummaryToast from './SummaryToast.svelte';

function renderToast() {
	const dismissals: number[] = [];
	const result = render(SummaryToast, {
		props: {
			onDismiss: () => {
				dismissals.push(1);
			}
		}
	});

	return { ...result, dismissals: () => dismissals.length };
}

function actionOf(container: HTMLElement): HTMLAnchorElement {
	const action = Array.from(container.querySelectorAll('a')).find((link) =>
		link.textContent?.includes('RETURN TO SUMMARY')
	);
	if (!action) throw new Error('toast rendered without its action');
	return action;
}

describe('SummaryToast', () => {
	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
	});

	it('names the terminal as the place the reader now is', () => {
		const { container } = renderToast();

		expect(container.textContent).toContain('YOU ARE IN THE TERMINAL.');
	});

	it('offers one click back to the summary', () => {
		const { container } = renderToast();

		expect(actionOf(container).getAttribute('href')).toBe('/one-pager');
	});

	it('dismisses when the reader takes the way back', async () => {
		const { container, dismissals } = renderToast();
		const action = actionOf(container);
		// Keeps jsdom from attempting the document navigation it does not implement.
		action.addEventListener('click', (event) => event.preventDefault());

		await fireEvent.click(action);

		expect(dismissals()).toBe(1);
	});

	it('dismisses on the cross, which is named for screen readers', async () => {
		const { container, dismissals } = renderToast();
		const close = container.querySelector('[aria-label="Dismiss notice"]') as HTMLElement;

		await fireEvent.click(close);

		expect(dismissals()).toBe(1);
	});

	it('reads as paper rather than terminal chrome', () => {
		const { container } = renderToast();
		const card = container.firstElementChild as HTMLElement;

		expect(card.className).toContain('bg-paper-base');
		expect(card.className).toContain('text-paper-ink');
		expect(card.className).toContain('font-outfit');
	});

	it('is taped on and tilted, so it looks placed rather than docked', () => {
		const { container } = renderToast();
		const card = container.firstElementChild as HTMLElement;
		const strip = card.querySelector('img');

		expect(card.className).toContain('md:-rotate-1');
		expect(strip?.getAttribute('src')).toBe('/tape.svg');
		expect(strip?.getAttribute('aria-hidden')).toBe('true');
	});

	it('keeps the tape out of the component, so the shape lives with the other assets', () => {
		const { container } = renderToast();

		expect(container.querySelector('svg')).toBeNull();
	});

	it('loads the paper typeface on the routes that do not carry it', () => {
		renderToast();

		const hrefs = Array.from(document.head.querySelectorAll('link')).map((link) =>
			link.getAttribute('href')
		);

		expect(hrefs.some((href) => href?.includes('family=Outfit'))).toBe(true);
	});
});

describe('the tape asset', () => {
	it('paints the tape in the raised paper tone the theme declares', () => {
		expect(tape.toUpperCase()).toContain(`FILL="${THEME_COLORS.paper.raised.toUpperCase()}"`);
	});

	it('stays translucent, so the card shows through the strip', () => {
		expect(tape).toContain('fill-opacity="0.65"');
	});
});
