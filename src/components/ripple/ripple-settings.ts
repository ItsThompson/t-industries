import type { RipplePaletteEntry, RippleSettings } from './types';

/**
 * Pastel hues cycled one per ripple. This is illustration, not site identity,
 * so it stays local instead of joining THEME_COLORS.
 */
export const RIPPLE_PALETTE: readonly RipplePaletteEntry[] = [
	{ name: 'blush', hue: 350 },
	{ name: 'peach', hue: 22 },
	{ name: 'butter', hue: 46 },
	{ name: 'sage', hue: 108 },
	{ name: 'mint', hue: 158 },
	{ name: 'sky', hue: 202 },
	{ name: 'periwinkle', hue: 232 },
	{ name: 'lilac', hue: 272 },
	{ name: 'rose', hue: 322 }
];

export const RIPPLE_SETTINGS: RippleSettings = {
	sizePx: 260,
	lifetimeMs: 2600,
	strokeWidthPx: 3,
	opacity: 0.68,
	saturationPercent: 62,
	lightnessPercent: 80,
	maxRipples: 160
};
