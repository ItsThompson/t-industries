import { describe, it, expect } from 'vitest';
import { wcagContrast } from 'culori/fn';
import {
	hexToRgbTriplet,
	PAPER_BAND_ALPHA,
	PAPER_BAND_ALPHA_HOVER,
	PAPER_BAND_CLASSES,
	PAPER_BAND_MIN_CONTRAST,
	paperBandColor,
	PAPER_GRAIN_OPACITY,
	PAPER_GRAIN_URI,
	paperBandStyle
} from './paper';
import { ACCENTS } from './accents';
import { THEME_COLORS } from './theme';

const PAPER = THEME_COLORS.paper.base;

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

describe('paperBandColor', () => {
	it('keeps an accent that already stands off the paper', () => {
		expect(paperBandColor(ACCENTS.amazon)).toBe(ACCENTS.amazon);
		expect(paperBandColor(ACCENTS.msd)).toBe(ACCENTS.msd);
		expect(paperBandColor(ACCENTS.primary)).toBe(ACCENTS.primary);
	});

	it('darkens the accent that would vanish into the paper', () => {
		expect(paperBandColor(ACCENTS.secondary100)).not.toBe(ACCENTS.secondary100);
	});

	it('carries every band past the visibility floor', () => {
		Object.values(ACCENTS).forEach((accent) => {
			expect(wcagContrast(paperBandColor(accent), PAPER)).toBeGreaterThanOrEqual(
				PAPER_BAND_MIN_CONTRAST
			);
		});
	});

	it('moves the accent toward ink, keeping the hue it started with', () => {
		const darkened = paperBandColor(ACCENTS.secondary100);

		expect(wcagContrast(darkened, PAPER)).toBeGreaterThan(
			wcagContrast(ACCENTS.secondary100, PAPER)
		);
	});

	it('rejects a value that is not a color', () => {
		expect(() => paperBandColor('chartreuse-ish')).toThrow();
	});
});

describe('paperBandStyle', () => {
	it('carries the band color and both opacities', () => {
		const style = paperBandStyle(ACCENTS.amazon);

		expect(style).toContain('--band:255,153,0');
		expect(style).toContain(`--band-alpha:${PAPER_BAND_ALPHA}`);
		expect(style).toContain(`--band-alpha-hover:${PAPER_BAND_ALPHA_HOVER}`);
	});

	it('passes the darkened color, not the raw accent, to the band', () => {
		expect(paperBandStyle(ACCENTS.secondary100)).not.toContain(
			hexToRgbTriplet(ACCENTS.secondary100)
		);
	});

	it('does not paint text with the raw accent, which fails on paper', () => {
		expect(paperBandStyle('#FF9900')).not.toContain('--band-ink');
	});
});

describe('paper band tokens', () => {
	it('raises the opacity on hover, so the band reacts without a color change', () => {
		expect(PAPER_BAND_ALPHA_HOVER).toBeGreaterThan(PAPER_BAND_ALPHA);
	});

	it('keeps the band translucent enough for ink to stay legible on paper', () => {
		expect(PAPER_BAND_ALPHA).toBeLessThan(0.5);
	});

	it('clones the decoration across a wrapped line, so both lines carry a band', () => {
		expect(PAPER_BAND_CLASSES).toContain('[box-decoration-break:clone]');
	});

	it('reads its color from the band custom property rather than a fixed color', () => {
		expect(PAPER_BAND_CLASSES).toContain('rgba(var(--band),var(--band-alpha))');
	});
});

describe('PAPER_GRAIN_OPACITY', () => {
	it('shows the grain instead of burying it in the paper tone', () => {
		expect(PAPER_GRAIN_OPACITY).toBeGreaterThanOrEqual(0.15);
	});

	it('stays a translucent coat, not an opaque image', () => {
		expect(PAPER_GRAIN_OPACITY).toBeLessThanOrEqual(1);
	});
});

describe('PAPER_GRAIN_URI', () => {
	it('is a single inline image, so the grain costs no second request', () => {
		expect(PAPER_GRAIN_URI.startsWith('url("data:image/svg+xml,')).toBe(true);
		expect(PAPER_GRAIN_URI.endsWith('")')).toBe(true);
	});

	it('tiles a noise filter instead of a bitmap', () => {
		expect(PAPER_GRAIN_URI).toContain('feTurbulence');
		expect(PAPER_GRAIN_URI).toContain('stitchTiles');
	});
});
