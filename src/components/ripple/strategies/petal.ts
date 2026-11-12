import { TAU, easedRadiusPx, fadeOut, hsla } from './paint';
import type { RippleStrategy } from '../types';

const FADE_POWER = 1.2;
const MIN_RADIUS_PX = 3;
const STEPS = 96;
const LOBE_AMPLITUDE = 0.3;
const RIPPLE_AMPLITUDE = 0.06;
const GRADIENT_SCALE = 1.3;

export const petalStrategy: RippleStrategy = {
	name: 'petal',
	draw(ctx, ripple, progress) {
		const radiusPx = easedRadiusPx(ripple, progress);
		if (radiusPx < MIN_RADIUS_PX) return;

		ctx.beginPath();

		for (let step = 0; step <= STEPS; step++) {
			const angle = (step / STEPS) * TAU;
			const radiusScale =
				1 +
				LOBE_AMPLITUDE * Math.cos(ripple.lobes * angle + ripple.spin + progress * 1.3) +
				RIPPLE_AMPLITUDE * Math.sin(2 * angle - progress * 2);
			const x = ripple.x + Math.cos(angle) * radiusPx * radiusScale;
			const y = ripple.y + Math.sin(angle) * radiusPx * radiusScale;

			if (step === 0) {
				ctx.moveTo(x, y);
			} else {
				ctx.lineTo(x, y);
			}
		}

		ctx.closePath();

		const gradient = ctx.createRadialGradient(
			ripple.x,
			ripple.y,
			0,
			ripple.x,
			ripple.y,
			radiusPx * GRADIENT_SCALE
		);
		gradient.addColorStop(0, hsla(ripple, 0.58));
		gradient.addColorStop(0.7, hsla(ripple, 0.34));
		gradient.addColorStop(1, hsla(ripple, 0.03));

		ctx.globalAlpha = ripple.opacity * fadeOut(progress, FADE_POWER);
		ctx.fillStyle = gradient;
		ctx.fill();
	}
};
