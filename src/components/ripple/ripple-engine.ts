import type { Ripple, RippleEngine, RippleEngineConfig } from './types';

const LIFETIME_JITTER_FLOOR = 0.8;
const LIFETIME_JITTER_RANGE = 0.4;
const SIZE_JITTER_FLOOR = 0.82;
const SIZE_JITTER_RANGE = 0.36;
const MIN_LOBES = 3;
const LOBE_RANGE = 6;
const SEED_RANGE = 1e9;

export function createRippleEngine(config: RippleEngineConfig): RippleEngine {
	const { settings, palette, strategies } = config;
	const random = config.random ?? Math.random;

	if (strategies.length === 0) {
		throw new Error('ripple engine needs at least one strategy');
	}
	if (palette.length === 0) {
		throw new Error('ripple engine needs at least one palette entry');
	}

	const ripples: Ripple[] = [];
	let paletteCursor = 0;

	function nextHue(): number {
		const entry = palette[paletteCursor];
		paletteCursor = (paletteCursor + 1) % palette.length;
		return entry.hue;
	}

	function randomTurn(): number {
		return random() * Math.PI * 2;
	}

	function jitter(floor: number, range: number): number {
		return floor + random() * range;
	}

	return {
		spawn(x, y, now): void {
			if (ripples.length >= settings.maxRipples) return;

			const strategyIndex = Math.min(
				strategies.length - 1,
				Math.floor(random() * strategies.length)
			);

			ripples.push({
				strategy: strategies[strategyIndex],
				x,
				y,
				bornAt: now,
				lifetimeMs: settings.lifetimeMs * jitter(LIFETIME_JITTER_FLOOR, LIFETIME_JITTER_RANGE),
				sizePx: settings.sizePx * jitter(SIZE_JITTER_FLOOR, SIZE_JITTER_RANGE),
				hue: nextHue(),
				saturationPercent: settings.saturationPercent,
				lightnessPercent: settings.lightnessPercent,
				strokeWidthPx: settings.strokeWidthPx,
				opacity: settings.opacity,
				seed: Math.floor(random() * SEED_RANGE),
				phase1: randomTurn(),
				phase2: randomTurn(),
				phase3: randomTurn(),
				lobes: MIN_LOBES + Math.floor(random() * LOBE_RANGE),
				spin: randomTurn()
			});
		},

		frame(ctx, now): number {
			for (let index = ripples.length - 1; index >= 0; index--) {
				const ripple = ripples[index];
				const progress = (now - ripple.bornAt) / ripple.lifetimeMs;
				if (progress >= 1) {
					ripples.splice(index, 1);
					continue;
				}
				if (progress <= 0) continue;

				ripple.strategy.draw(ctx, ripple, progress);
			}

			ctx.globalAlpha = 1;

			return ripples.length;
		},

		reset(): void {
			ripples.length = 0;
		}
	};
}
