import { easedRadiusPx, fadeOut, paintBand } from './paint';
import type { RippleStrategy } from '../types';

const FADE_POWER = 1.5;
const THICKNESS_SCALE = 4;
const THICKNESS_SHRINK = 0.5;
const MIN_THICKNESS_PX = 3;
const MIN_RADIUS_PX = 1;

export const ringStrategy: RippleStrategy = {
	name: 'ring',
	draw(ctx, ripple, progress) {
		const radiusPx = easedRadiusPx(ripple, progress);
		if (radiusPx < MIN_RADIUS_PX) return;

		const thicknessPx = Math.max(
			MIN_THICKNESS_PX,
			ripple.strokeWidthPx * THICKNESS_SCALE * (1 - progress * THICKNESS_SHRINK)
		);
		paintBand(ctx, ripple, radiusPx, thicknessPx, ripple.opacity * fadeOut(progress, FADE_POWER));
	}
};
