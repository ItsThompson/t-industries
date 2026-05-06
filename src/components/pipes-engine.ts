export enum Direction {
	UP = 0,
	RIGHT = 1,
	DOWN = 2,
	LEFT = 3
}

export interface Segment {
	x: number;
	y: number;
	char: string;
	age: number;
}

export interface Pipe {
	x: number;
	y: number;
	direction: Direction;
	tailLength: number;
	segments: Segment[];
	isPrimary: boolean;
	color: string;
}

export interface PipesConfig {
	cols: number;
	rows: number;
	straightProbability: number;
	minTailLength: number;
	maxTailLength: number;
	grayColor: string;
	primaryColor: string;
}

export interface PipesState {
	pipes: Pipe[];
	config: PipesConfig;
	canAnimate: boolean;
}

const MIN_GRID_SIZE = 10;
const MIN_PIPES = 4;
const MAX_PIPES = 20;
const PIPE_COUNT_DIVISOR = 8;

/**
 * Character map indexed by [prevDirection][nextDirection].
 * Only ±90° turns and straight-ahead are valid.
 */
const CHARACTER_MAP: Record<Direction, Record<Direction, string>> = {
	[Direction.UP]: {
		[Direction.UP]: '┃',
		[Direction.RIGHT]: '┏',
		[Direction.DOWN]: '', // 180° - invalid
		[Direction.LEFT]: '┓'
	},
	[Direction.RIGHT]: {
		[Direction.UP]: '┛',
		[Direction.RIGHT]: '━',
		[Direction.DOWN]: '┓',
		[Direction.LEFT]: '' // 180° - invalid
	},
	[Direction.DOWN]: {
		[Direction.UP]: '', // 180° - invalid
		[Direction.RIGHT]: '┗',
		[Direction.DOWN]: '┃',
		[Direction.LEFT]: '┛'
	},
	[Direction.LEFT]: {
		[Direction.UP]: '┗',
		[Direction.RIGHT]: '', // 180° - invalid
		[Direction.DOWN]: '┏',
		[Direction.LEFT]: '━'
	}
};

export function getCharacter(prevDirection: Direction, nextDirection: Direction): string {
	return CHARACTER_MAP[prevDirection][nextDirection];
}

export function calculatePipeCount(cols: number, rows: number): number {
	return Math.max(MIN_PIPES, Math.min(MAX_PIPES, Math.floor(Math.sqrt(cols * rows) / PIPE_COUNT_DIVISOR)));
}

export function calculateSegmentOpacity(age: number, tailLength: number): number {
	if (age >= tailLength) return 0;
	return 1 - age / tailLength;
}

function getOppositeDirection(direction: Direction): Direction {
	return (direction + 2) % 4 as Direction;
}

function getValidDirections(currentDirection: Direction): Direction[] {
	const opposite = getOppositeDirection(currentDirection);
	return [Direction.UP, Direction.RIGHT, Direction.DOWN, Direction.LEFT].filter(
		(dir) => dir !== opposite
	);
}

function chooseNextDirection(
	currentDirection: Direction,
	straightProbability: number,
	random: () => number
): Direction {
	if (random() < straightProbability) {
		return currentDirection;
	}
	const validDirections = getValidDirections(currentDirection);
	const turns = validDirections.filter((dir) => dir !== currentDirection);
	return turns[Math.floor(random() * turns.length)];
}

function randomInt(min: number, max: number, random: () => number): number {
	return Math.floor(random() * (max - min + 1)) + min;
}

function createPipe(config: PipesConfig, isPrimary: boolean, random: () => number): Pipe {
	const x = Math.floor(random() * config.cols);
	const y = Math.floor(random() * config.rows);
	const direction = Math.floor(random() * 4) as Direction;
	const tailLength = randomInt(config.minTailLength, config.maxTailLength, random);

	return {
		x,
		y,
		direction,
		tailLength,
		segments: [],
		isPrimary,
		color: isPrimary ? config.primaryColor : config.grayColor
	};
}

function wrapPosition(x: number, y: number, cols: number, rows: number): { x: number; y: number } {
	return {
		x: ((x % cols) + cols) % cols,
		y: ((y % rows) + rows) % rows
	};
}

function advancePipe(pipe: Pipe, config: PipesConfig, random: () => number): void {
	const nextDirection = chooseNextDirection(pipe.direction, config.straightProbability, random);
	const char = getCharacter(pipe.direction, nextDirection);

	// Add current position as a new segment
	pipe.segments.unshift({
		x: pipe.x,
		y: pipe.y,
		char,
		age: 0
	});

	// Age all segments
	pipe.segments.forEach((segment) => {
		segment.age++;
	});

	// Cull segments beyond tail length
	if (pipe.segments.length > pipe.tailLength) {
		pipe.segments.length = pipe.tailLength;
	}

	// Move head in the new direction
	let newX = pipe.x;
	let newY = pipe.y;

	switch (nextDirection) {
		case Direction.UP:
			newY--;
			break;
		case Direction.RIGHT:
			newX++;
			break;
		case Direction.DOWN:
			newY++;
			break;
		case Direction.LEFT:
			newX--;
			break;
	}

	const wrapped = wrapPosition(newX, newY, config.cols, config.rows);
	pipe.x = wrapped.x;
	pipe.y = wrapped.y;
	pipe.direction = nextDirection;
}

function isPipeFullyFaded(pipe: Pipe): boolean {
	return pipe.segments.length > 0 && pipe.segments.every((segment) => segment.age >= pipe.tailLength);
}

export function createEngine(
	config: PipesConfig,
	random: () => number = Math.random
): PipesState {
	const canAnimate = config.cols >= MIN_GRID_SIZE && config.rows >= MIN_GRID_SIZE;

	if (!canAnimate) {
		return { pipes: [], config, canAnimate };
	}

	const pipeCount = calculatePipeCount(config.cols, config.rows);
	const pipes: Pipe[] = [];

	// First pipe is always primary
	pipes.push(createPipe(config, true, random));

	// Remaining pipes are gray
	for (let i = 1; i < pipeCount; i++) {
		pipes.push(createPipe(config, false, random));
	}

	return { pipes, config, canAnimate };
}

export function step(state: PipesState, random: () => number = Math.random): void {
	if (!state.canAnimate) return;

	let hasPrimary = false;

	state.pipes.forEach((pipe, index) => {
		if (isPipeFullyFaded(pipe)) {
			// Replace dead pipe. If we lost the primary, respawn it as primary.
			const needsPrimary = pipe.isPrimary || !state.pipes.some((p) => p.isPrimary && p !== pipe);
			state.pipes[index] = createPipe(state.config, needsPrimary, random);
		} else {
			advancePipe(pipe, state.config, random);
		}

		if (state.pipes[index].isPrimary) {
			hasPrimary = true;
		}
	});

	// Safety: ensure at least one primary pipe always exists
	if (!hasPrimary && state.pipes.length > 0) {
		state.pipes[0].isPrimary = true;
		state.pipes[0].color = state.config.primaryColor;
	}
}

export function getVisibleSegments(state: PipesState): Array<Segment & { color: string; opacity: number }> {
	if (!state.canAnimate) return [];

	return state.pipes.flatMap((pipe) =>
		pipe.segments.reduce<Array<Segment & { color: string; opacity: number }>>((acc, segment) => {
			const opacity = calculateSegmentOpacity(segment.age, pipe.tailLength);
			if (opacity > 0) {
				acc.push({ ...segment, color: pipe.color, opacity });
			}
			return acc;
		}, [])
	);
}
