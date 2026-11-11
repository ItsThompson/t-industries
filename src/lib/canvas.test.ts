import { describe, it, expect } from 'vitest';
import { wcagContrast } from 'culori/fn';
import grain from '../../static/grain.svg?raw';
import {
	hexToRgbTriplet,
	CANVAS_BAND_ALPHA,
	CANVAS_BAND_ALPHA_HOVER,
	CANVAS_BAND_CLASSES,
	CANVAS_BAND_MIN_CONTRAST,
	canvasBandColor,
	CANVAS_GRAIN_OPACITY,
	canvasBandStyle
} from './canvas';
import { ACCENTS } from './accents';
import { THEME_COLORS } from './theme';

const CANVAS = THEME_COLORS.canvas.base;

describe('hexToRgbTriplet', () => {
	it('splits a hex color into the channels a custom property can hold', () => {
		expect(hexToRgbTriplet('#FF9900')).toBe('255,153,0');
		expect(hexToRgbTriplet('#009484')).toBe('0,148,132');
	});

	it('reads channels in either case', () => {
		expect(hexToRgbTriplet('#abdbFA')).toBe(hexToRgbTriplet('#ABDBFA'));
	});

	it('expands the three digit shorthand', () => {
		expect(hexToRgbTriplet('#F90')).toBe('255,153,0');
	});

	it('rejects a value that is not a color, instead of painting a bad band', () => {
		expect(() => hexToRgbTriplet('#GG9900')).toThrow();
		expect(() => hexToRgbTriplet('not a color')).toThrow();
	});

	it('names the value it rejected, so a bad accent is easy to trace', () => {
		expect(() => hexToRgbTriplet('#GG9900')).toThrow(/#GG9900/);
	});
});

describe('canvasBandColor', () => {
	it('keeps an accent that already stands off the canvas', () => {
		expect(canvasBandColor(ACCENTS.amazon)).toBe(ACCENTS.amazon);
		expect(canvasBandColor(ACCENTS.msd)).toBe(ACCENTS.msd);
		expect(canvasBandColor(ACCENTS.primary)).toBe(ACCENTS.primary);
	});

	it('darkens the accent that would vanish into the canvas', () => {
		expect(canvasBandColor(ACCENTS.secondary100)).not.toBe(ACCENTS.secondary100);
	});

	it('carries every band past the visibility floor', () => {
		Object.values(ACCENTS).forEach((accent) => {
			expect(wcagContrast(canvasBandColor(accent), CANVAS)).toBeGreaterThanOrEqual(
				CANVAS_BAND_MIN_CONTRAST
			);
		});
	});

	it('moves the accent toward ink, keeping the hue it started with', () => {
		const darkened = canvasBandColor(ACCENTS.secondary100);

		expect(wcagContrast(darkened, CANVAS)).toBeGreaterThan(
			wcagContrast(ACCENTS.secondary100, CANVAS)
		);
	});

	it('rejects a value that is not a color', () => {
		expect(() => canvasBandColor('chartreuse-ish')).toThrow();
	});
});

describe('canvasBandStyle', () => {
	it('carries the band color and both opacities', () => {
		const style = canvasBandStyle(ACCENTS.amazon);

		expect(style).toContain('--band:255,153,0');
		expect(style).toContain(`--band-alpha:${CANVAS_BAND_ALPHA}`);
		expect(style).toContain(`--band-alpha-hover:${CANVAS_BAND_ALPHA_HOVER}`);
	});

	it('passes the darkened color, not the raw accent, to the band', () => {
		expect(canvasBandStyle(ACCENTS.secondary100)).not.toContain(
			hexToRgbTriplet(ACCENTS.secondary100)
		);
	});

	it('does not paint text with the raw accent, which fails on canvas', () => {
		expect(canvasBandStyle('#FF9900')).not.toContain('--band-ink');
	});
});

describe('canvas band tokens', () => {
	it('raises the opacity on hover, so the band reacts without a color change', () => {
		expect(CANVAS_BAND_ALPHA_HOVER).toBeGreaterThan(CANVAS_BAND_ALPHA);
	});

	it('keeps the band translucent enough for ink to stay legible on canvas', () => {
		expect(CANVAS_BAND_ALPHA).toBeLessThan(0.5);
	});

	it('clones the decoration across a wrapped line, so both lines carry a band', () => {
		expect(CANVAS_BAND_CLASSES).toContain('[box-decoration-break:clone]');
	});

	it('reads its color from the band custom property rather than a fixed color', () => {
		expect(CANVAS_BAND_CLASSES).toContain('rgba(var(--band),var(--band-alpha))');
	});
});

describe('CANVAS_GRAIN_OPACITY', () => {
	it('shows the grain instead of burying it in the canvas tone', () => {
		expect(CANVAS_GRAIN_OPACITY).toBeGreaterThanOrEqual(0.15);
	});

	it('stays a translucent coat, not an opaque image', () => {
		expect(CANVAS_GRAIN_OPACITY).toBeLessThanOrEqual(1);
	});
});

describe('the grain asset', () => {
	it('tiles a noise filter instead of a bitmap', () => {
		expect(grain).toContain('feTurbulence');
		expect(grain).toContain('stitchTiles');
	});

	it('draws across the whole tile, so the repeat has no bare edge', () => {
		expect(grain).toContain('width="180" height="180"');
	});
});
