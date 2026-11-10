import { describe, it, expect } from 'vitest';
import {
	contrastRatio,
	hexToRgbTriplet,
	PAPER_BAND_ALPHA,
	PAPER_BAND_ALPHA_HOVER,
	PAPER_BAND_CLASSES,
	PAPER_BAND_MIN_CONTRAST,
	paperBandColor,
	PAPER_GRAIN_URI,
	paperBandStyle
} from './paper';
import { ACCENTS } from './accents';
import { THEME_COLORS } from './theme';

describe('hexToRgbTriplet', () => {
	it('splits a six digit hex color into its channels', () => {
		expect(hexToRgbTriplet('#FF9900')).toBe('255,153,0');
		expect(hexToRgbTriplet('#009484')).toBe('0,148,132');
	});

	it('reads channels in either case', () => {
		expect(hexToRgbTriplet('#abdbFA')).toBe(hexToRgbTriplet('#ABDBFA'));
	});

	it('rejects a short hex color instead of guessing the shorthand', () => {
		expect(() => hexToRgbTriplet('#F90')).toThrow();
	});

	it('rejects a hex color without the leading hash', () => {
		expect(() => hexToRgbTriplet('FF9900')).toThrow();
	});

	it('rejects characters that are not hex digits', () => {
		expect(() => hexToRgbTriplet('#GG9900')).toThrow();
	});

	it('names the value it rejected, so a bad accent is easy to trace', () => {
		expect(() => hexToRgbTriplet('#GG9900')).toThrow(/#GG9900/);
	});
});

describe('contrastRatio', () => {
	it('measures black against white at the WCAG maximum', () => {
		expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1);
	});

	it('gives the same answer whichever order the colors arrive in', () => {
		expect(contrastRatio('#FF9900', '#F4EFE2')).toBeCloseTo(
			contrastRatio('#F4EFE2', '#FF9900'),
			5
		);
	});

	it('rejects a malformed color rather than guessing', () => {
		expect(() => contrastRatio('#FFF', '#FFFFFF')).toThrow();
	});
});

describe('paperBandColor', () => {
	const PAPER = THEME_COLORS.paper.base;

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
			expect(contrastRatio(paperBandColor(accent), PAPER)).toBeGreaterThanOrEqual(
				PAPER_BAND_MIN_CONTRAST
			);
		});
	});

	it('moves the accent toward ink, keeping the hue it started with', () => {
		const darkened = paperBandColor(ACCENTS.secondary100);

		expect(contrastRatio(darkened, PAPER)).toBeGreaterThan(
			contrastRatio(ACCENTS.secondary100, PAPER)
		);
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
