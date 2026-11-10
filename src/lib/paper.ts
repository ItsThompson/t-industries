/** Which page a component renders for: the black site or the paper page. */
export type PageTone = 'terminal' | 'paper';

/** Opacity of a highlighter band at rest, over the paper background. */
export const PAPER_BAND_ALPHA = 0.4;

/** Opacity of a highlighter band while the reader points at it. */
export const PAPER_BAND_ALPHA_HOVER = 0.54;

/**
 * Band styling shared by every highlighter on the paper page. The band color
 * and its two opacities arrive as the `--band`, `--band-alpha`, and
 * `--band-alpha-hover` custom properties, so the alpha values live here and not
 * in each component's stylesheet.
 */
export const PAPER_BAND_CLASSES =
	'bg-[rgba(var(--band),var(--band-alpha))] hover:bg-[rgba(var(--band),var(--band-alpha-hover))] [box-decoration-break:clone] [-webkit-box-decoration-break:clone] px-[0.18em] py-[0.04em] -mx-[0.02em] rounded-[3px] transition-colors duration-150';

/** Turns `#FF9900` into `255,153,0`, for `rgba(var(--band), alpha)`. */
export function hexToRgbTriplet(hex: string): string {
	if (!/^#[0-9a-f]{6}$/i.test(hex)) {
		throw new Error(`expected a six digit hex color, received "${hex}"`);
	}

	const [r, g, b] = [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16));
	return `${r},${g},${b}`;
}

/** Inline custom properties that let a band read its color and opacities. */
export function paperBandStyle(accent: string): string {
	return [
		`--band:${hexToRgbTriplet(accent)}`,
		`--band-alpha:${PAPER_BAND_ALPHA}`,
		`--band-alpha-hover:${PAPER_BAND_ALPHA_HOVER}`
	].join(';');
}

/**
 * Fiber noise that gives the paper its tooth. It tiles at 180px and is drawn
 * once, so the whole page costs one small image.
 */
export const PAPER_GRAIN_URI =
	"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E\")";
