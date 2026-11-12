import { easedRadiusPx, fadeOut, hsla } from './paint';
import type { RippleStrategy } from '../types';

const FADE_POWER = 1.2;
const MIN_RADIUS_PX = 2;

export const bloomStrategy: RippleStrategy = {
	name: 'bloom',
	draw(ctx, ripple, progress) {
		const radiusPx = easedRadiusPx(ripple, progress);
		if (radiusPx < MIN_RADIUS_PX) return;

		const gradient = ctx.createRadialGradient(ripple.x, ripple.y, 0, ripple.x, ripple.y, radiusPx);
		gradient.addColorStop(0, hsla(ripple, 0.95));
		gradient.addColorStop(0.5, hsla(ripple, 0.48));
		gradient.addColorStop(1, hsla(ripple, 0));

		ctx.globalAlpha = ripple.opacity * fadeOut(progress, FADE_POWER);
		ctx.fillStyle = gradient;
		ctx.beginPath();
		ctx.arc(ripple.x, ripple.y, radiusPx, 0, Math.PI * 2);
		ctx.fill();
	}
};
