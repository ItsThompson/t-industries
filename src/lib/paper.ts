import { THEME_COLORS } from './theme';

/** Which page a component renders for: the black site or the paper page. */
export type PageTone = 'terminal' | 'paper';

/** Opacity of a highlighter band at rest, over the paper background. */
export const PAPER_BAND_ALPHA = 0.4;

/** Opacity of a highlighter band while the reader points at it. */
export const PAPER_BAND_ALPHA_HOVER = 0.54;

/**
 * How far a band must stand off the paper before it reads as a highlight. An
 * accent that sits closer than this vanishes into the page at any opacity, so
 * the band is darkened toward ink until it clears the floor.
 */
export const PAPER_BAND_MIN_CONTRAST = 1.5;

/** One step of the walk toward ink, as a fraction of the accent. */
const DARKEN_STEP = 0.1;

/**
 * Band styling shared by every highlighter on the paper page. The band color
 * and its two opacities arrive as the `--band`, `--band-alpha`, and
 * `--band-alpha-hover` custom properties, so the alpha values live here and not
 * in each component's stylesheet.
 */
export const PAPER_BAND_CLASSES =
	'bg-[rgba(var(--band),var(--band-alpha))] hover:bg-[rgba(var(--band),var(--band-alpha-hover))] [box-decoration-break:clone] [-webkit-box-decoration-break:clone] px-[0.18em] py-[0.04em] -mx-[0.02em] rounded-[3px] transition-colors duration-150 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-paper-ink';

/** Turns `#FF9900` into `255,153,0`, for `rgba(var(--band), alpha)`. */
export function hexToRgbTriplet(hex: string): string {
	return hexChannels(hex).join(',');
}

/** WCAG contrast between two colors, so a band can be judged against the paper. */
export function contrastRatio(a: string, b: string): number {
	const [lighter, darker] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
	return (lighter + 0.05) / (darker + 0.05);
}

/**
 * The color a band paints on paper. A brand accent that is too close to the
 * paper is walked toward ink, in steps, until the band is visible.
 */
export function paperBandColor(accent: string): string {
	const paper = THEME_COLORS.paper.base;
	if (contrastRatio(accent, paper) >= PAPER_BAND_MIN_CONTRAST) return accent;

	for (let amount = DARKEN_STEP; amount < 1; amount += DARKEN_STEP) {
		const darkened = mixHex(accent, THEME_COLORS.paper.ink, amount);
		if (contrastRatio(darkened, paper) >= PAPER_BAND_MIN_CONTRAST) return darkened;
	}

	return THEME_COLORS.paper.ink;
}

/** Inline custom properties that let a band read its color and opacities. */
export function paperBandStyle(accent: string): string {
	return [
		`--band:${hexToRgbTriplet(paperBandColor(accent))}`,
		`--band-alpha:${PAPER_BAND_ALPHA}`,
		`--band-alpha-hover:${PAPER_BAND_ALPHA_HOVER}`
	].join(';');
}

function hexChannels(hex: string): [number, number, number] {
	if (!/^#[0-9a-f]{6}$/i.test(hex)) {
		throw new Error(`expected a six digit hex color, received "${hex}"`);
	}

	const channel = (offset: number): number => parseInt(hex.slice(offset, offset + 2), 16);
	return [channel(1), channel(3), channel(5)];
}

function mixHex(from: string, to: string, amount: number): string {
	const source = hexChannels(from);
	const target = hexChannels(to);

	const mixed = source.map((channel, index) =>
		Math.round(channel + (target[index] - channel) * amount)
	);

	return `#${mixed.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
}

function relativeLuminance(hex: string): number {
	const [r, g, b] = hexChannels(hex).map((channel) => {
		const value = channel / 255;
		return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
	});

	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Fiber noise that gives the paper its tooth. It tiles at 180px and is drawn
 * once, so the whole page costs one small image.
 */
export const PAPER_GRAIN_URI =
	"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E\")";
