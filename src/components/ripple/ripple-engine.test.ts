import { describe, it, expect } from 'vitest';
import { createRippleEngine } from './ripple-engine';
import type { Ripple, RippleEngine, RipplePaletteEntry, RippleSettings, RippleStrategy } from './types';

const SETTINGS: RippleSettings = {
	sizePx: 260,
	lifetimeMs: 1000,
	strokeWidthPx: 3,
	opacity: 0.68,
	saturationPercent: 62,
	lightnessPercent: 80,
	maxRipples: 160
};

const PALETTE: readonly RipplePaletteEntry[] = [
	{ name: 'first', hue: 10 },
	{ name: 'second', hue: 20 }
];

interface Recorder {
	strategy: RippleStrategy;
	drawn: Ripple[];
}

function createRecorder(): Recorder {
	const drawn: Ripple[] = [];

	return {
		drawn,
		strategy: {
			name: 'recorder',
			draw: (_ctx, ripple) => {
				drawn.push(ripple);
			}
		}
	};
}

/** The recording strategy never reads the context, so an empty stand-in is enough. */
function fakeContext(): CanvasRenderingContext2D {
	return {} as CanvasRenderingContext2D;
}

function sequenceRandom(values: readonly number[]): () => number {
	let index = 0;

	return () => {
		const value = values[index] ?? 0.5;
		index += 1;
		return value;
	};
}

function buildEngine(
	recorder: Recorder,
	overrides: Partial<RippleSettings> = {},
	random?: () => number
): RippleEngine {
	return createRippleEngine({
		settings: { ...SETTINGS, ...overrides },
		palette: PALETTE,
		strategies: [recorder.strategy],
		random
	});
}

describe('createRippleEngine', () => {
	it('spawns one ripple at the press point, and only one', () => {
		const recorder = createRecorder();
		const engine = buildEngine(recorder);

		engine.spawn(10, 20, 0);
		engine.frame(fakeContext(), 16);
		engine.frame(fakeContext(), 400);

		expect(recorder.drawn.length).toBeGreaterThan(0);
		expect(new Set(recorder.drawn).size).toBe(1);
		expect(recorder.drawn[0]).toMatchObject({ x: 10, y: 20 });
	});

	it('holds at most maxRipples at a time', () => {
		const recorder = createRecorder();
		const engine = buildEngine(recorder, { maxRipples: 2 });

		engine.spawn(0, 0, 0);
		engine.spawn(0, 0, 1);
		engine.spawn(0, 0, 2);

		expect(engine.frame(fakeContext(), 10)).toBe(2);
	});

	it('drops a ripple once its lifetime runs out', () => {
		const recorder = createRecorder();
		const engine = buildEngine(recorder);

		engine.spawn(0, 0, 0);

		expect(engine.frame(fakeContext(), 5000)).toBe(0);
		expect(recorder.drawn).toHaveLength(0);
	});

	it('cycles the palette in order, one hue per ripple', () => {
		const recorder = createRecorder();
		const engine = buildEngine(recorder);

		engine.spawn(0, 0, 0);
		engine.frame(fakeContext(), 10);
		engine.spawn(0, 0, 20);
		engine.frame(fakeContext(), 30);

		expect(recorder.drawn.slice(0, 2).map((ripple) => ripple.hue)).toEqual([10, 20]);
	});

	it('draws with the strategy the random roll selects', () => {
		const first = createRecorder();
		const second = createRecorder();
		const strategies = [first.strategy, second.strategy];

		const lowRoll = createRippleEngine({
			settings: SETTINGS,
			palette: PALETTE,
			strategies,
			random: sequenceRandom([0])
		});
		lowRoll.spawn(0, 0, 0);
		lowRoll.frame(fakeContext(), 10);

		const highRoll = createRippleEngine({
			settings: SETTINGS,
			palette: PALETTE,
			strategies,
			random: sequenceRandom([0.99])
		});
		highRoll.spawn(0, 0, 0);
		highRoll.frame(fakeContext(), 10);

		expect([first.drawn.length, second.drawn.length]).toEqual([1, 1]);
	});

	it('reports how many ripples are left, so the caller can idle', () => {
		const engine = buildEngine(createRecorder());

		engine.spawn(0, 0, 0);
		expect(engine.frame(fakeContext(), 10)).toBe(1);
		expect(engine.frame(fakeContext(), 2000)).toBe(0);
	});

	it('clears every ripple on reset', () => {
		const engine = buildEngine(createRecorder());

		engine.spawn(0, 0, 0);
		engine.reset();

		expect(engine.frame(fakeContext(), 1)).toBe(0);
	});

	it('refuses to run without a strategy or a palette', () => {
		expect(() =>
			createRippleEngine({ settings: SETTINGS, palette: PALETTE, strategies: [] })
		).toThrow();
		expect(() =>
			createRippleEngine({
				settings: SETTINGS,
				palette: [],
				strategies: [createRecorder().strategy]
			})
		).toThrow();
	});
});
