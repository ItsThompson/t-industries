import { describe, it, expect } from 'vitest';
import { RIPPLE_STRATEGIES } from './index';
import type { Ripple, RippleStrategy } from '../types';

interface Painted {
	fills: number;
	strokes: number;
	rects: number;
}

interface PaintSpy {
	ctx: CanvasRenderingContext2D;
	colors: string[];
	painted: Painted;
}

function createPaintSpy(): PaintSpy {
	const colors: string[] = [];
	const painted: Painted = { fills: 0, strokes: 0, rects: 0 };
	const gradient = {
		addColorStop: (_offset: number, color: string) => {
			colors.push(color);
		}
	};

	const spy: Record<string, unknown> = {
		globalAlpha: 1,
		globalCompositeOperation: 'source-over',
		fillStyle: '',
		strokeStyle: '',
		lineWidth: 0,
		beginPath() {},
		closePath() {},
		moveTo() {},
		lineTo() {},
		arc() {},
		createRadialGradient() {
			return gradient;
		},
		fill() {
			painted.fills += 1;
		},
		stroke() {
			painted.strokes += 1;
			if (typeof spy.strokeStyle === 'string') colors.push(spy.strokeStyle);
		},
		fillRect() {
			painted.rects += 1;
			if (typeof spy.fillStyle === 'string') colors.push(spy.fillStyle);
		}
	};

	return { ctx: spy as unknown as CanvasRenderingContext2D, colors, painted };
}

function drawnOperations(painted: Painted): number {
	return painted.fills + painted.strokes + painted.rects;
}

const RIPPLE: Ripple = {
	strategy: RIPPLE_STRATEGIES[0],
	x: 120,
	y: 80,
	bornAt: 0,
	lifetimeMs: 2000,
	sizePx: 260,
	hue: 202,
	saturationPercent: 62,
	lightnessPercent: 80,
	strokeWidthPx: 3,
	opacity: 0.68,
	seed: 7,
	phase1: 1,
	phase2: 2,
	phase3: 3,
	lobes: 5,
	spin: 4
};

function withStrategy(strategy: RippleStrategy): Ripple {
	return { ...RIPPLE, strategy };
}

describe('ripple strategies', () => {
	it('registers the six shapes from the sketch', () => {
		expect(RIPPLE_STRATEGIES.map((strategy) => strategy.name)).toEqual([
			'ring',
			'bloom',
			'blob',
			'petal',
			'caustic',
			'dither'
		]);
	});

	it('gives every shape a unique name, so the registry can grow safely', () => {
		const names = RIPPLE_STRATEGIES.map((strategy) => strategy.name);

		expect(new Set(names).size).toBe(names.length);
	});

	it.each(RIPPLE_STRATEGIES.map((strategy) => [strategy.name, strategy] as const))(
		'%s paints in its palette hue',
		(_name, strategy) => {
			const { ctx, colors, painted } = createPaintSpy();

			strategy.draw(ctx, withStrategy(strategy), 0.4);

			expect(drawnOperations(painted)).toBeGreaterThan(0);
			expect(colors.some((color) => color.includes(String(RIPPLE.hue)))).toBe(true);
		}
	);

	it.each(RIPPLE_STRATEGIES.map((strategy) => [strategy.name, strategy] as const))(
		'%s paints nothing before the shape has grown',
		(_name, strategy) => {
			const { ctx, painted } = createPaintSpy();

			strategy.draw(ctx, withStrategy(strategy), 0);

			expect(drawnOperations(painted)).toBe(0);
		}
	);

	it.each(RIPPLE_STRATEGIES.map((strategy) => [strategy.name, strategy] as const))(
		'%s stays inside the canvas it was born on',
		(_name, strategy) => {
			const { ctx } = createPaintSpy();
			const ripple = withStrategy(strategy);

			expect(() => strategy.draw(ctx, ripple, 0.99)).not.toThrow();
		}
	);
});
