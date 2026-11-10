import { describe, it, expect } from 'vitest';
import {
	hexToRgbTriplet,
	PAPER_BAND_ALPHA,
	PAPER_BAND_ALPHA_HOVER,
	PAPER_BAND_CLASSES,
	PAPER_GRAIN_URI,
	paperBandStyle
} from './paper';

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

describe('paperBandStyle', () => {
	it('carries the band color and both opacities', () => {
		const style = paperBandStyle('#FF9900');

		expect(style).toContain('--band:255,153,0');
		expect(style).toContain(`--band-alpha:${PAPER_BAND_ALPHA}`);
		expect(style).toContain(`--band-alpha-hover:${PAPER_BAND_ALPHA_HOVER}`);
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
