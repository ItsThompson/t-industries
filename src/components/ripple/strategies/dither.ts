import { TAU, easedRadiusPx, fadeOut, hash2, hsl } from './paint';
import type { RippleStrategy } from '../types';

const FADE_POWER = 1.2;
const MIN_RADIUS_PX = 6;
const BLOCK_SCALE = 5;
const MIN_BLOCK_PX = 5;
const MIN_ANGLE_STEP = 0.01;
const ROWS = 2;
const SKIP_THRESHOLD = 0.88;
const ALPHA_FLOOR = 0.4;
const ALPHA_RANGE = 0.6;
const INNER_ROW_ALPHA = 0.75;

export const ditherStrategy: RippleStrategy = {
	name: 'dither',
	draw(ctx, ripple, progress) {
		const radiusPx = easedRadiusPx(ripple, progress);
		if (radiusPx < MIN_RADIUS_PX) return;

		const blockPx = Math.max(MIN_BLOCK_PX, Math.round(ripple.strokeWidthPx * BLOCK_SCALE));
		const angleStep = Math.max(MIN_ANGLE_STEP, blockPx / radiusPx);
		const baseAlpha = fadeOut(progress, FADE_POWER) * ripple.opacity;

		ctx.fillStyle = hsl(ripple);

		for (let row = 0; row < ROWS; row++) {
			const ringRadiusPx = radiusPx - row * blockPx;
			if (ringRadiusPx < blockPx) continue;

			for (let angle = row * angleStep * 0.5; angle < TAU; angle += angleStep) {
				const snappedX = Math.round((ripple.x + Math.cos(angle) * ringRadiusPx) / blockPx) * blockPx;
				const snappedY = Math.round((ripple.y + Math.sin(angle) * ringRadiusPx) / blockPx) * blockPx;
				const cell = hash2(snappedX, snappedY, ripple.seed);
				if (cell > SKIP_THRESHOLD) continue;

				ctx.globalAlpha =
					baseAlpha * (ALPHA_FLOOR + ALPHA_RANGE * cell) * (row === 0 ? 1 : INNER_ROW_ALPHA);
				ctx.fillRect(snappedX - blockPx / 2, snappedY - blockPx / 2, blockPx, blockPx);
			}
		}
	}
};
