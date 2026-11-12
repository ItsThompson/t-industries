export interface RipplePaletteEntry {
	name: string;
	hue: number;
}

export interface RippleSettings {
	sizePx: number;
	lifetimeMs: number;
	strokeWidthPx: number;
	opacity: number;
	saturationPercent: number;
	lightnessPercent: number;
	maxRipples: number;
}

export interface Ripple {
	strategy: RippleStrategy;
	x: number;
	y: number;
	bornAt: number;
	lifetimeMs: number;
	sizePx: number;
	hue: number;
	saturationPercent: number;
	lightnessPercent: number;
	strokeWidthPx: number;
	opacity: number;
	seed: number;
	phase1: number;
	phase2: number;
	phase3: number;
	lobes: number;
	spin: number;
}

export interface RippleStrategy {
	name: string;
	draw(ctx: CanvasRenderingContext2D, ripple: Ripple, progress: number): void;
}

export interface RippleEngineConfig {
	settings: RippleSettings;
	palette: readonly RipplePaletteEntry[];
	strategies: readonly RippleStrategy[];
	random?: () => number;
}

export interface RippleEngine {
	spawn(x: number, y: number, now: number): void;

	/** Draws the live ripples and returns how many are left, so the caller can idle. */
	frame(ctx: CanvasRenderingContext2D, now: number): number;

	reset(): void;
}
