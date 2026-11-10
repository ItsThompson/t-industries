import type { CubicSegment, Point } from './types';

/**
 * Samples per cubic segment when curvature is measured. Analytic curvature is
 * sampled, not approximated, so this only sets how finely the worst spot is
 * found, not how accurately it is measured.
 */
export const CURVATURE_SAMPLES_PER_SEGMENT = 32;

const EPSILON = 1e-9;

export function distance(a: Point, b: Point): number {
	return Math.hypot(b.x - a.x, b.y - a.y);
}

export function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

/**
 * Endpoints are reflected rather than duplicated, which keeps the exit and
 * landing tangents horizontal instead of collapsing them to zero length.
 */
function reflectEnds(points: Point[]): Point[] {
	const first = points[0];
	const second = points[1];
	const last = points[points.length - 1];
	const penultimate = points[points.length - 2];

	return [
		{ x: 2 * first.x - second.x, y: 2 * first.y - second.y },
		...points,
		{ x: 2 * last.x - penultimate.x, y: 2 * last.y - penultimate.y },
	];
}

function cubicSegment(p0: Point, p1: Point, p2: Point, p3: Point, alpha: number): CubicSegment {
	const d01 = Math.pow(distance(p0, p1), alpha);
	const d12 = Math.pow(distance(p1, p2), alpha);
	const d23 = Math.pow(distance(p2, p3), alpha);

	let c1 = p1;
	if (d01 > EPSILON) {
		const a = 2 * d01 * d01 + 3 * d01 * d12 + d12 * d12;
		const n = 3 * d01 * (d01 + d12);
		c1 = {
			x: (p1.x * a - p0.x * d12 * d12 + p2.x * d01 * d01) / n,
			y: (p1.y * a - p0.y * d12 * d12 + p2.y * d01 * d01) / n,
		};
	}

	let c2 = p2;
	if (d23 > EPSILON) {
		const b = 2 * d23 * d23 + 3 * d23 * d12 + d12 * d12;
		const m = 3 * d23 * (d23 + d12);
		c2 = {
			x: (p2.x * b + p1.x * d23 * d23 - p3.x * d12 * d12) / m,
			y: (p2.y * b + p1.y * d23 * d23 - p3.y * d12 * d12) / m,
		};
	}

	return { p0: p1, c1, c2, p3: p2 };
}

/**
 * Fits a Catmull-Rom spline through the points, as cubic Bezier segments.
 * Centripetal parameterization (alpha 0.5) keeps the curve from cusping and
 * overshooting when waypoint spacing varies, which random waypoints produce.
 */
export function catmullRomSegments(points: Point[], alpha = 0.5): CubicSegment[] {
	const frames = reflectEnds(points);
	const segments: CubicSegment[] = [];

	for (let index = 0; index + 3 < frames.length; index += 1) {
		segments.push(
			cubicSegment(frames[index], frames[index + 1], frames[index + 2], frames[index + 3], alpha),
		);
	}

	return segments;
}

export function pointAt(segment: CubicSegment, t: number): Point {
	const mt = 1 - t;
	const a = mt * mt * mt;
	const b = 3 * mt * mt * t;
	const c = 3 * mt * t * t;
	const d = t * t * t;

	return {
		x: a * segment.p0.x + b * segment.c1.x + c * segment.c2.x + d * segment.p3.x,
		y: a * segment.p0.y + b * segment.c1.y + c * segment.c2.y + d * segment.p3.y,
	};
}

export function tangentAt(segment: CubicSegment, t: number): Point {
	const mt = 1 - t;

	return {
		x:
			3 * mt * mt * (segment.c1.x - segment.p0.x) +
			6 * mt * t * (segment.c2.x - segment.c1.x) +
			3 * t * t * (segment.p3.x - segment.c2.x),
		y:
			3 * mt * mt * (segment.c1.y - segment.p0.y) +
			6 * mt * t * (segment.c2.y - segment.c1.y) +
			3 * t * t * (segment.p3.y - segment.c2.y),
	};
}

/** Exact analytic curvature of one cubic: kappa = |x'y'' - y'x''| / |B'|^3. */
function curvatureAt(segment: CubicSegment, t: number): number {
	const mt = 1 - t;

	const dx =
		3 * mt * mt * (segment.c1.x - segment.p0.x) +
		6 * mt * t * (segment.c2.x - segment.c1.x) +
		3 * t * t * (segment.p3.x - segment.c2.x);
	const dy =
		3 * mt * mt * (segment.c1.y - segment.p0.y) +
		6 * mt * t * (segment.c2.y - segment.c1.y) +
		3 * t * t * (segment.p3.y - segment.c2.y);

	const ddx =
		6 * mt * (segment.c2.x - 2 * segment.c1.x + segment.p0.x) +
		6 * t * (segment.p3.x - 2 * segment.c2.x + segment.c1.x);
	const ddy =
		6 * mt * (segment.c2.y - 2 * segment.c1.y + segment.p0.y) +
		6 * t * (segment.p3.y - 2 * segment.c2.y + segment.c1.y);

	const speed = Math.hypot(dx, dy);
	if (speed < EPSILON) return Infinity;

	return Math.abs(dx * ddy - dy * ddx) / Math.pow(speed, 3);
}

/**
 * Tightest turn radius along the path, resolution independent unlike a
 * turn-angle-per-sample proxy, so the cap means the same thing at every size.
 */
export function minimumTurnRadius(segments: CubicSegment[]): number {
	let sharpest = 0;

	for (const segment of segments) {
		for (let sample = 0; sample <= CURVATURE_SAMPLES_PER_SEGMENT; sample += 1) {
			const kappa = curvatureAt(segment, sample / CURVATURE_SAMPLES_PER_SEGMENT);
			if (kappa > sharpest) sharpest = kappa;
		}
	}

	return sharpest === 0 ? Infinity : 1 / sharpest;
}

export function pathLength(segments: CubicSegment[], perSegment = 24): number {
	let total = 0;

	for (const segment of segments) {
		let previous = pointAt(segment, 0);
		for (let sample = 1; sample <= perSegment; sample += 1) {
			const next = pointAt(segment, sample / perSegment);
			total += distance(previous, next);
			previous = next;
		}
	}

	return total;
}

function round(value: number): number {
	return Math.round(value * 100) / 100;
}

export function pathData(segments: CubicSegment[]): string {
	const [first] = segments;
	const parts = [`M${round(first.p0.x)} ${round(first.p0.y)}`];

	for (const segment of segments) {
		parts.push(
			`C${round(segment.c1.x)} ${round(segment.c1.y)} ${round(segment.c2.x)} ${round(segment.c2.y)} ${round(segment.p3.x)} ${round(segment.p3.y)}`,
		);
	}

	return parts.join(' ');
}
