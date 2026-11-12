import { TAU, easedRadiusPx, fadeOut, hsla } from './paint';
import type { Ripple, RippleStrategy } from '../types';

const FADE_POWER = 1.1;
const MIN_RADIUS_PX = 3;
const STEPS = 58;
const WOBBLE = 0.11;
const GRADIENT_SCALE = 1.12;

function organicPath(
	ctx: CanvasRenderingContext2D,
	ripple: Ripple,
	radiusPx: number,
	progress: number
): void {
	ctx.beginPath();

	for (let step = 0; step <= STEPS; step++) {
		const angle = (step / STEPS) * TAU;
		const radiusScale =
			1 +
			WOBBLE * Math.sin(3 * angle + ripple.phase1 + progress * 1.6) +
			WOBBLE * 0.6 * Math.sin(5 * angle + ripple.phase2 - progress * 1.1) +
			WOBBLE * 0.34 * Math.sin(7 * angle + ripple.phase3 + progress * 0.7);
		const x = ripple.x + Math.cos(angle) * radiusPx * radiusScale;
		const y = ripple.y + Math.sin(angle) * radiusPx * radiusScale;

		if (step === 0) {
			ctx.moveTo(x, y);
		} else {
			ctx.lineTo(x, y);
		}
	}

	ctx.closePath();
}

export const blobStrategy: RippleStrategy = {
	name: 'blob',
	draw(ctx, ripple, progress) {
		const radiusPx = easedRadiusPx(ripple, progress);
		if (radiusPx < MIN_RADIUS_PX) return;

		organicPath(ctx, ripple, radiusPx, progress);

		const gradient = ctx.createRadialGradient(
			ripple.x,
			ripple.y,
			0,
			ripple.x,
			ripple.y,
			radiusPx * GRADIENT_SCALE
		);
		gradient.addColorStop(0, hsla(ripple, 0.66));
		gradient.addColorStop(0.62, hsla(ripple, 0.46));
		gradient.addColorStop(1, hsla(ripple, 0.05));

		ctx.globalAlpha = ripple.opacity * fadeOut(progress, FADE_POWER);
		ctx.fillStyle = gradient;
		ctx.fill();
	}
};
