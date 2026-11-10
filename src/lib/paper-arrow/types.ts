export interface Point {
	x: number;
	y: number;
}

export type ArrowFamily = 'loop' | 'curl' | 'wobble' | 'overshoot' | 'wander';

export interface CubicSegment {
	p0: Point;
	c1: Point;
	c2: Point;
	p3: Point;
}

/**
 * The measurements a path is composed inside. Every value is a document
 * coordinate, so nothing here depends on the viewport or the DOM.
 */
export interface ArrowFrame {
	/** Start of the stroke, just inside the phrase highlight. */
	a: Point;
	/** Arrowhead tip, on the entry's left edge. */
	b: Point;
	/** The turn-radius cap the caller asked of the finished spline. */
	minRadius: number;
	/** Radius the pen draws at so the spline through its samples respects `minRadius`. */
	radius: number;
	/** Spacing between sampled points along the pen's path. */
	step: number;
	/** Horizontal run the final quarter turn lands on the tip with. */
	runIn: number;
	/** Column the path drops down before turning onto the entry. */
	pivot: Point;
	/** Vertical room the family must leave for the side-step onto the pivot column. */
	reserve: number;
	/** Horizontal run out of the phrase before the turn into the gutter. */
	exitRun: number;
	leftEdge: number;
	rightEdge: number;
}

export interface BuiltArrow {
	segments: CubicSegment[];
	/** Arc length of `segments`, in pixels. */
	length: number;
	/** Tightest turn radius actually drawn, in pixels. `Infinity` when the path is straight. */
	minTurnRadius: number;
	/** Number of pen samples the spline was fitted through. */
	waypoints: number;
	family: ArrowFamily;
	/** True when every scribble was rejected and the plain swoop was used. */
	usedPlainShape: boolean;
}
