import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import CanvasLayout from './+layout.svelte';
import { CANVAS_GRAIN_OPACITY } from '$lib/canvas';
import { THEME_COLORS } from '$lib/theme';

function headHrefs(): string[] {
	return Array.from(document.head.querySelectorAll('link')).map(
		(link) => link.getAttribute('href') ?? ''
	);
}

describe('(canvas) +layout', () => {
	afterEach(() => {
		cleanup();
	});

	it('lays a grain over the canvas at a strength that shows', () => {
		const { container } = render(CanvasLayout);
		const grain = container.querySelector('[aria-hidden="true"]') as HTMLElement;

		expect(grain.style.backgroundImage).toContain('/grain.svg');
		expect(Number(grain.style.opacity)).toBe(CANVAS_GRAIN_OPACITY);
		expect(grain.className).toContain('mix-blend-multiply');
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
