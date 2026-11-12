import { TAU, easedRadiusPx, fadeOut, hsla, strokeShadedEdge } from './paint';
import type { Ripple, RippleStrategy } from '../types';

const FADE_POWER = 1.2;
const MIN_RADIUS_PX = 4;
const STEPS = 96;
const INNER_LAYER_SHRINK = 0.17;
const OUTER_STROKE_FLOOR_PX = 5;
const OUTER_STROKE_SCALE = 3;
const INNER_STROKE_FLOOR_PX = 1.2;
const INNER_STROKE_SCALE = 0.6;
const STROKE_ALPHA = 0.3;

function causticPath(
	ctx: CanvasRenderingContext2D,
	ripple: Ripple,
	radiusPx: number,
	progress: number,
	layer: number
): void {
	ctx.beginPath();

	for (let step = 0; step <= STEPS; step++) {
		const angle = (step / STEPS) * TAU;
		const warp =
			0.055 * Math.sin(6 * angle + progress * 7 + layer * 2.1) +
			0.034 * Math.sin(11 * angle - progress * 5 + layer) +
			0.018 * Math.sin(17 * angle + progress * 3);
		const layerRadiusPx = radiusPx * (1 + warp) * (1 - layer * INNER_LAYER_SHRINK);
		const x = ripple.x + Math.cos(angle) * layerRadiusPx;
		const y = ripple.y + Math.sin(angle) * layerRadiusPx;

		if (step === 0) {
			ctx.moveTo(x, y);
		} else {
			ctx.lineTo(x, y);
		}
	}

	ctx.closePath();
}

export const causticStrategy: RippleStrategy = {
	name: 'caustic',
	draw(ctx, ripple, progress) {
		const radiusPx = easedRadiusPx(ripple, progress);
		if (radiusPx < MIN_RADIUS_PX) return;

		const fade = fadeOut(progress, FADE_POWER);

		causticPath(ctx, ripple, radiusPx, progress, 0);
		const gradient = ctx.createRadialGradient(
			ripple.x,
			ripple.y,
			0,
			ripple.x,
			ripple.y,
			radiusPx * 1.2
		);
		gradient.addColorStop(0, hsla(ripple, 0.55));
		gradient.addColorStop(0.8, hsla(ripple, 0.42));
		gradient.addColorStop(1, hsla(ripple, 0.3));

		ctx.globalAlpha = ripple.opacity * fade;
		ctx.fillStyle = gradient;
		ctx.fill();

		strokeShadedEdge(
			ctx,
			ripple,
			Math.max(OUTER_STROKE_FLOOR_PX, ripple.strokeWidthPx * OUTER_STROKE_SCALE),
			ripple.opacity * fade * STROKE_ALPHA
		);

		causticPath(ctx, ripple, radiusPx, progress, 1);
		strokeShadedEdge(
			ctx,
			ripple,
			Math.max(INNER_STROKE_FLOOR_PX, ripple.strokeWidthPx * INNER_STROKE_SCALE),
			ripple.opacity * fadeOut(progress, FADE_POWER + 0.1) * STROKE_ALPHA
		);
	}
};
