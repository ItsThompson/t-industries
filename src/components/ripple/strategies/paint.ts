import type { Ripple } from '../types';

export const TAU = Math.PI * 2;

const BAND_OCTAVE = 0.42;
const BAND_PASSES = 4;

export function easeOutCubic(progress: number): number {
	return 1 - Math.pow(1 - progress, 3);
}

export function easedRadiusPx(ripple: Ripple, progress: number): number {
	return ripple.sizePx * easeOutCubic(clamp01(progress));
}

export function fadeOut(progress: number, power: number): number {
	return Math.pow(1 - progress, power);
}

export function hsl(ripple: Ripple): string {
	return `hsl(${ripple.hue} ${ripple.saturationPercent}% ${ripple.lightnessPercent}%)`;
}

export function hsla(ripple: Ripple, alpha: number): string {
	return `hsla(${ripple.hue}, ${ripple.saturationPercent}%, ${ripple.lightnessPercent}%, ${alpha})`;
}

/** Paints a band of light around a radius: no outline, shading that falls off toward both edges. */
export function paintBand(
	ctx: CanvasRenderingContext2D,
	ripple: Ripple,
	radiusPx: number,
	thicknessPx: number,
	alpha: number
): void {
	const innerPx = Math.max(0, radiusPx - thicknessPx);
	const outerPx = radiusPx + thicknessPx;
	const gradient = ctx.createRadialGradient(ripple.x, ripple.y, innerPx, ripple.x, ripple.y, outerPx);

	gradient.addColorStop(0, hsla(ripple, 0));
	gradient.addColorStop(0.34, hsla(ripple, alpha * 0.5));
	gradient.addColorStop(0.5, hsla(ripple, alpha));
	gradient.addColorStop(0.66, hsla(ripple, alpha * 0.5));
	gradient.addColorStop(1, hsla(ripple, 0));

	ctx.globalAlpha = 1;
	ctx.fillStyle = gradient;
	ctx.beginPath();
	ctx.arc(ripple.x, ripple.y, outerPx, 0, TAU);
	ctx.fill();
}

export function strokeShadedEdge(
	ctx: CanvasRenderingContext2D,
	ripple: Ripple,
	widthPx: number,
	alpha: number
): void {
	ctx.strokeStyle = hsl(ripple);

	for (let pass = BAND_PASSES - 1; pass >= 0; pass--) {
		ctx.lineWidth = widthPx * (1 + pass * 1.2);
		ctx.globalAlpha = alpha * Math.pow(BAND_OCTAVE, pass);
		ctx.stroke();
	}
}

/** Stable pseudo-random value in [0, 1) for a grid cell, so dither blocks never flicker. */
export function hash2(x: number, y: number, seed: number): number {
	let hash = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(seed | 0, 2246822519);
	hash = Math.imul(hash ^ (hash >>> 13), 1274126177);
	return ((hash ^ (hash >>> 16)) >>> 0) / 4294967296;
}

function clamp01(value: number): number {
	return value < 0 ? 0 : value > 1 ? 1 : value;
}
