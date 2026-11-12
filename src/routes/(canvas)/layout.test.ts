import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import CanvasLayout from './+layout.svelte';
import { CANVAS_GRAIN_OPACITY } from '$lib/canvas';
import { THEME_COLORS } from '$lib/theme';

function headHrefs(): string[] {
	return Array.from(document.head.querySelectorAll('link')).map(
		(link) => link.getAttribute('href') ?? ''
	);
}

function stubMotionPreference(matches: boolean): void {
	vi.stubGlobal(
		'matchMedia',
		vi.fn().mockImplementation((query: string) => ({
			matches,
			media: query,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn()
		}))
	);
}

describe('(canvas) +layout', () => {
	beforeEach(() => {
		stubMotionPreference(false);
		HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
			setTransform: vi.fn(),
			clearRect: vi.fn(),
			globalAlpha: 1
		});
	});

	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	it('lays a grain over the canvas at a strength that shows', () => {
		const { container } = render(CanvasLayout);
		const grain = container.querySelector('.mix-blend-multiply') as HTMLElement;

		expect(grain.style.backgroundImage).toContain('/grain.svg');
		expect(Number(grain.style.opacity)).toBe(CANVAS_GRAIN_OPACITY);
	});

	it('paints the grain first and the ripples next, so both sit behind the text', () => {
		const { container } = render(CanvasLayout);
		const [first, second] = Array.from(container.children);

		expect(first.className).toContain('mix-blend-multiply');
		expect(second.tagName).toBe('CANVAS');
	});

	it('leaves the ripple canvas in the flow of the DOM, never above the text', () => {
		const { container } = render(CanvasLayout);
		const canvas = container.querySelector('canvas');

		expect(canvas?.className).toContain('pointer-events-none');
		expect(canvas?.className).not.toMatch(/(^|\s)z-/);
		expect(canvas?.getAttribute('aria-hidden')).toBe('true');
	});

	it('leaves the ripples out when the reader asks for reduced motion', () => {
		stubMotionPreference(true);

		const { container } = render(CanvasLayout);

		expect(container.querySelector('canvas')).toBeNull();
	});

	it('paints the body before hydration, so overscroll never shows the black site', () => {
		render(CanvasLayout);

		const style = document.head.querySelector('style')?.textContent ?? '';

		expect(style).toContain(THEME_COLORS.canvas.base);
	});

	it('loads the Outfit family for every canvas route', () => {
		render(CanvasLayout);

		expect(headHrefs().some((href) => href.includes('family=Outfit'))).toBe(true);
	});

	it('warms the font connections before the stylesheet asks for them', () => {
		render(CanvasLayout);

		const preconnects = Array.from(document.head.querySelectorAll('link[rel="preconnect"]'));

		expect(preconnects.length).toBeGreaterThanOrEqual(2);
	});
});
