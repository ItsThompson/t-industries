import { describe, it, expect } from 'vitest';
import {
	Direction,
	createEngine,
	step,
	getVisibleSegments,
	calculatePipeCount,
	calculateSegmentOpacity,
	getCharacter
} from './pipes-engine';
import type { PipesConfig, PipesState } from './pipes-engine';

function createTestConfig(overrides: Partial<PipesConfig> = {}): PipesConfig {
	return {
		cols: 80,
		rows: 40,
		straightProbability: 0.7,
		minTailLength: 30,
		maxTailLength: 50,
		grayColor: '#444444',
		primaryColor: '#FF6363',
		...overrides
	};
}

function createSeededRandom(values: number[]): () => number {
	let index = 0;
	return () => {
		const value = values[index % values.length];
		index++;
		return value;
	};
}

describe('pipes-engine', () => {
	describe('Direction transitions', () => {
		it('never produces 180° reversal from UP', () => {
			const config = createTestConfig();
			// random value > straightProbability triggers a turn,
			// then 0.0 picks the first turn option
			const random = createSeededRandom([0.9, 0.0]);
			const state = createEngine(config, () => 0.5);

			// Force pipe direction to UP
			state.pipes[0].direction = Direction.UP;
			step(state, random);

			expect(state.pipes[0].direction).not.toBe(Direction.DOWN);
		});

		it('never produces 180° reversal from RIGHT', () => {
			const config = createTestConfig();
			const random = createSeededRandom([0.9, 0.0]);
			const state = createEngine(config, () => 0.5);

			state.pipes[0].direction = Direction.RIGHT;
			step(state, random);

			expect(state.pipes[0].direction).not.toBe(Direction.LEFT);
		});

		it('never produces 180° reversal from DOWN', () => {
			const config = createTestConfig();
			const random = createSeededRandom([0.9, 0.0]);
			const state = createEngine(config, () => 0.5);

			state.pipes[0].direction = Direction.DOWN;
			step(state, random);

			expect(state.pipes[0].direction).not.toBe(Direction.UP);
		});

		it('never produces 180° reversal from LEFT', () => {
			const config = createTestConfig();
			const random = createSeededRandom([0.9, 0.0]);
			const state = createEngine(config, () => 0.5);

			state.pipes[0].direction = Direction.LEFT;
			step(state, random);

			expect(state.pipes[0].direction).not.toBe(Direction.RIGHT);
		});

		it('continues straight with high probability', () => {
			const config = createTestConfig({ straightProbability: 0.7 });
			// random < 0.7 means go straight
			const random = createSeededRandom([0.5]);
			const state = createEngine(config, () => 0.5);

			state.pipes[0].direction = Direction.RIGHT;
			step(state, random);

			expect(state.pipes[0].direction).toBe(Direction.RIGHT);
		});
	});

	describe('Character selection', () => {
		it('returns ┃ for UP → UP (straight vertical)', () => {
			expect(getCharacter(Direction.UP, Direction.UP)).toBe('┃');
		});

		it('returns ━ for RIGHT → RIGHT (straight horizontal)', () => {
			expect(getCharacter(Direction.RIGHT, Direction.RIGHT)).toBe('━');
		});

		it('returns ┃ for DOWN → DOWN (straight vertical)', () => {
			expect(getCharacter(Direction.DOWN, Direction.DOWN)).toBe('┃');
		});

		it('returns ━ for LEFT → LEFT (straight horizontal)', () => {
			expect(getCharacter(Direction.LEFT, Direction.LEFT)).toBe('━');
		});

		it('returns ┏ for UP → RIGHT (turn down-right)', () => {
			expect(getCharacter(Direction.UP, Direction.RIGHT)).toBe('┏');
		});

		it('returns ┓ for UP → LEFT (turn down-left)', () => {
			expect(getCharacter(Direction.UP, Direction.LEFT)).toBe('┓');
		});

		it('returns ┛ for RIGHT → UP (turn up-left)', () => {
			expect(getCharacter(Direction.RIGHT, Direction.UP)).toBe('┛');
		});

		it('returns ┓ for RIGHT → DOWN (turn down-left)', () => {
			expect(getCharacter(Direction.RIGHT, Direction.DOWN)).toBe('┓');
		});

		it('returns ┗ for DOWN → RIGHT (turn up-right)', () => {
			expect(getCharacter(Direction.DOWN, Direction.RIGHT)).toBe('┗');
		});

		it('returns ┛ for DOWN → LEFT (turn up-left)', () => {
			expect(getCharacter(Direction.DOWN, Direction.LEFT)).toBe('┛');
		});

		it('returns ┗ for LEFT → UP (turn up-right)', () => {
			expect(getCharacter(Direction.LEFT, Direction.UP)).toBe('┗');
		});

		it('returns ┏ for LEFT → DOWN (turn down-right)', () => {
			expect(getCharacter(Direction.LEFT, Direction.DOWN)).toBe('┏');
		});
	});

	describe('Grid wrapping', () => {
		it('wraps right edge to left', () => {
			const config = createTestConfig({ cols: 20, rows: 20 });
			// Straight probability high, so it continues RIGHT
			const random = createSeededRandom([0.1]);
			const state = createEngine(config, () => 0.5);

			state.pipes[0].x = 19;
			state.pipes[0].y = 10;
			state.pipes[0].direction = Direction.RIGHT;
			step(state, random);

			expect(state.pipes[0].x).toBe(0);
		});

		it('wraps left edge to right', () => {
			const config = createTestConfig({ cols: 20, rows: 20 });
			const random = createSeededRandom([0.1]);
			const state = createEngine(config, () => 0.5);

			state.pipes[0].x = 0;
			state.pipes[0].y = 10;
			state.pipes[0].direction = Direction.LEFT;
			step(state, random);

			expect(state.pipes[0].x).toBe(19);
		});

		it('wraps bottom edge to top', () => {
			const config = createTestConfig({ cols: 20, rows: 20 });
			const random = createSeededRandom([0.1]);
			const state = createEngine(config, () => 0.5);

			state.pipes[0].x = 10;
			state.pipes[0].y = 19;
			state.pipes[0].direction = Direction.DOWN;
			step(state, random);

			expect(state.pipes[0].y).toBe(0);
		});

		it('wraps top edge to bottom', () => {
			const config = createTestConfig({ cols: 20, rows: 20 });
			const random = createSeededRandom([0.1]);
			const state = createEngine(config, () => 0.5);

			state.pipes[0].x = 10;
			state.pipes[0].y = 0;
			state.pipes[0].direction = Direction.UP;
			step(state, random);

			expect(state.pipes[0].y).toBe(19);
		});
	});

	describe('Pipe count formula', () => {
		it('returns MIN_PIPES for very small grids', () => {
			expect(calculatePipeCount(10, 10)).toBe(2);
		});

		it('returns correct value for medium grid', () => {
			// sqrt(80*40) = sqrt(3200) ≈ 56.57, /15 = 3.77, floor = 3
			expect(calculatePipeCount(80, 40)).toBe(3);
		});

		it('returns MAX_PIPES for very large grid', () => {
			// sqrt(500*500) = 500, /15 = 33.3, clamped to 12
			expect(calculatePipeCount(500, 500)).toBe(12);
		});

		it('clamps to MIN_PIPES when formula yields less', () => {
			// sqrt(15*15) = 15, /15 = 1, clamp to 2
			expect(calculatePipeCount(15, 15)).toBe(2);
		});

		it('scales proportionally with viewport', () => {
			const small = calculatePipeCount(40, 20);
			const large = calculatePipeCount(200, 100);
			expect(large).toBeGreaterThan(small);
		});
	});

	describe('Tail fade opacity', () => {
		it('returns full opacity for age 0', () => {
			expect(calculateSegmentOpacity(0, 40)).toBe(1);
		});

		it('returns 0.5 opacity at midpoint', () => {
			expect(calculateSegmentOpacity(20, 40)).toBe(0.5);
		});

		it('returns 0 opacity at tail length', () => {
			expect(calculateSegmentOpacity(40, 40)).toBe(0);
		});

		it('returns 0 opacity beyond tail length', () => {
			expect(calculateSegmentOpacity(50, 40)).toBe(0);
		});

		it('returns 0.75 opacity at quarter age', () => {
			expect(calculateSegmentOpacity(10, 40)).toBe(0.75);
		});
	});

	describe('Spawn logic', () => {
		it('creates pipe with position within grid bounds', () => {
			const config = createTestConfig({ cols: 30, rows: 20 });
			const state = createEngine(config);

			state.pipes.forEach((pipe) => {
				expect(pipe.x).toBeGreaterThanOrEqual(0);
				expect(pipe.x).toBeLessThan(30);
				expect(pipe.y).toBeGreaterThanOrEqual(0);
				expect(pipe.y).toBeLessThan(20);
			});
		});

		it('creates pipe with valid direction', () => {
			const config = createTestConfig();
			const state = createEngine(config);

			state.pipes.forEach((pipe) => {
				expect([Direction.UP, Direction.RIGHT, Direction.DOWN, Direction.LEFT]).toContain(
					pipe.direction
				);
			});
		});

		it('creates pipe with tailLength in [30, 50]', () => {
			const config = createTestConfig({ minTailLength: 30, maxTailLength: 50 });
			const state = createEngine(config);

			state.pipes.forEach((pipe) => {
				expect(pipe.tailLength).toBeGreaterThanOrEqual(30);
				expect(pipe.tailLength).toBeLessThanOrEqual(50);
			});
		});
	});

	describe('Red pipe guarantee', () => {
		it('always has exactly one primary pipe on creation', () => {
			const config = createTestConfig();
			const state = createEngine(config);

			const primaryPipes = state.pipes.filter((pipe) => pipe.isPrimary);
			expect(primaryPipes).toHaveLength(1);
		});

		it('primary pipe has primaryColor', () => {
			const config = createTestConfig();
			const state = createEngine(config);

			const primaryPipe = state.pipes.find((pipe) => pipe.isPrimary);
			expect(primaryPipe?.color).toBe('#FF6363');
		});

		it('non-primary pipes have gray color', () => {
			const config = createTestConfig();
			const state = createEngine(config);

			const grayPipes = state.pipes.filter((pipe) => !pipe.isPrimary);
			grayPipes.forEach((pipe) => {
				expect(pipe.color).toBe('#444444');
			});
		});

		it('respawns primary pipe when it fully fades', () => {
			const config = createTestConfig({ cols: 20, rows: 20, minTailLength: 3, maxTailLength: 3 });
			const state = createEngine(config, () => 0.5);

			// Force primary pipe to be "fully faded"
			const primaryIndex = state.pipes.findIndex((pipe) => pipe.isPrimary);
			const primaryPipe = state.pipes[primaryIndex];
			primaryPipe.segments = [
				{ x: 1, y: 1, char: '━', age: 3 },
				{ x: 2, y: 1, char: '━', age: 4 },
				{ x: 3, y: 1, char: '━', age: 5 }
			];

			step(state, () => 0.5);

			// After step, there should still be exactly one primary pipe
			const primaryPipes = state.pipes.filter((pipe) => pipe.isPrimary);
			expect(primaryPipes).toHaveLength(1);
			expect(primaryPipes[0].color).toBe('#FF6363');
		});
	});

	describe('Minimum grid guard', () => {
		it('signals no animation for 5x5 grid', () => {
			const config = createTestConfig({ cols: 5, rows: 5 });
			const state = createEngine(config);

			expect(state.canAnimate).toBe(false);
			expect(state.pipes).toHaveLength(0);
		});

		it('signals no animation for 9x9 grid', () => {
			const config = createTestConfig({ cols: 9, rows: 9 });
			const state = createEngine(config);

			expect(state.canAnimate).toBe(false);
		});

		it('signals animation OK for 10x10 grid', () => {
			const config = createTestConfig({ cols: 10, rows: 10 });
			const state = createEngine(config);

			expect(state.canAnimate).toBe(true);
			expect(state.pipes.length).toBeGreaterThan(0);
		});

		it('step does nothing when canAnimate is false', () => {
			const config = createTestConfig({ cols: 5, rows: 5 });
			const state = createEngine(config);

			step(state);

			expect(state.pipes).toHaveLength(0);
		});
	});

	describe('getVisibleSegments', () => {
		it('returns empty array when canAnimate is false', () => {
			const config = createTestConfig({ cols: 5, rows: 5 });
			const state = createEngine(config);

			expect(getVisibleSegments(state)).toHaveLength(0);
		});

		it('returns segments with color and opacity', () => {
			const config = createTestConfig({ cols: 20, rows: 20 });
			const state = createEngine(config, () => 0.5);

			// Run a few steps to generate segments
			for (let i = 0; i < 5; i++) {
				step(state, () => 0.3);
			}

			const segments = getVisibleSegments(state);
			expect(segments.length).toBeGreaterThan(0);

			segments.forEach((segment) => {
				expect(segment).toHaveProperty('x');
				expect(segment).toHaveProperty('y');
				expect(segment).toHaveProperty('char');
				expect(segment).toHaveProperty('color');
				expect(segment).toHaveProperty('opacity');
				expect(segment.opacity).toBeGreaterThan(0);
				expect(segment.opacity).toBeLessThanOrEqual(1);
			});
		});

		it('excludes segments with zero opacity', () => {
			const config = createTestConfig({ cols: 20, rows: 20, minTailLength: 3, maxTailLength: 3 });
			const state = createEngine(config, () => 0.5);

			// Run many steps to push segments beyond tail length
			for (let i = 0; i < 10; i++) {
				step(state, () => 0.3);
			}

			const segments = getVisibleSegments(state);
			segments.forEach((segment) => {
				expect(segment.opacity).toBeGreaterThan(0);
			});
		});
	});

	describe('Segment aging and culling', () => {
		it('ages segments with each step', () => {
			const config = createTestConfig({ cols: 20, rows: 20 });
			const state = createEngine(config, () => 0.5);

			step(state, () => 0.3);
			step(state, () => 0.3);

			// First pipe should have 2 segments, oldest has age 2
			const pipe = state.pipes[0];
			expect(pipe.segments.length).toBe(2);
			expect(pipe.segments[1].age).toBe(2); // oldest segment
			expect(pipe.segments[0].age).toBe(1); // newest segment
		});

		it('culls segments beyond tailLength', () => {
			const config = createTestConfig({ cols: 20, rows: 20, minTailLength: 3, maxTailLength: 3 });
			const state = createEngine(config, () => 0.5);

			// Run more steps than tail length
			for (let i = 0; i < 5; i++) {
				step(state, () => 0.3);
			}

			state.pipes.forEach((pipe) => {
				expect(pipe.segments.length).toBeLessThanOrEqual(pipe.tailLength);
			});
		});
	});
});
