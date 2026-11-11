import {
  clamp,
  catmullRomSegments,
  minimumTurnRadius,
  pathLength,
  tangentAt,
} from "./curve";
import {
  FAMILY_SHAPES,
  createPen,
  penStraight,
  penTurnInRadians,
  slideSideways,
} from "./families";
import type {
  ArrowFamily,
  ArrowFrame,
  BuiltArrow,
  CubicSegment,
  Point,
} from "./types";

/**
 * An interpolating spline overshoots wherever curvature jumps: a straight that
 * becomes an arc, and worse, an arc whose curvature reverses. Measured against
 * this generator, those land at about 0.7x the drawn radius and 0.5x it, and
 * the factor holds regardless of sampling density. Drawing 2.2x wider than the
 * cap is therefore what makes the cap true of the rendered curve, not just the
 * pen.
 */
export const PEN_SAFETY = 2.2;

export const DEFAULT_MIN_TURN_RADIUS = 14;

export const MAX_ATTEMPTS = 80;

export const FLIGHT_BASE_MS = 1000;
export const FLIGHT_REFERENCE_LENGTH_PX = 620;
export const FLIGHT_MIN_MS = 420;
export const FLIGHT_MAX_MS = 2600;

export const FADE_OUT_MS = 260;

export const ENTRY_INSET_PX = 16;

export const PHRASE_PADDING_PX = 2;

export const ARROW_EDGE_MARGIN_PX = 14;

export const ARROW_FAMILIES: readonly ArrowFamily[] = [
  "loop",
  "curl",
  "wobble",
  "overshoot",
  "wander",
];

export const HEAD_LENGTH_PX = 15;
export const HEAD_HALF_WIDTH_PX = 6;
export const HEAD_NOTCH_PX = 0.72;

export interface BuildArrowRequest {
  from: Point;
  /** Arrowhead tip. */
  to: Point;
  minTurnRadius: number;
  leftEdge: number;
  rightEdge: number;
  family: ArrowFamily;
  seed: number;
}

export function pickFamily(random: () => number): ArrowFamily {
  const index = Math.floor(random() * ARROW_FAMILIES.length);
  return ARROW_FAMILIES[clamp(index, 0, ARROW_FAMILIES.length - 1)];
}

function frameFor(request: BuildArrowRequest): ArrowFrame {
  const radius = request.minTurnRadius * PEN_SAFETY;
  const step = clamp(radius * 0.12, 2.5, 8);
  const runIn = clamp(radius * 1.2, 20, 60);

  return {
    startingPoint: request.from,
    endingPoint: request.to,
    minRadius: request.minTurnRadius,
    radius,
    step,
    runIn,
    // The closing quarter turn is measured back from here, so the arrowhead
    // ends up on the entry edge pointing right rather than wherever a free
    // walk happened to stop.
    pivot: { x: request.to.x - radius - runIn, y: request.to.y - radius },
    reserve: radius * 3.4,
    // Short, so the stroke dives below the line instead of running along
    // the words that precede the phrase.
    exitRun: clamp(radius * 0.3, 4, 14),
    leftEdge: request.leftEdge,
    rightEdge: request.rightEdge,
  };
}

function staysOnScreen(points: Point[], frame: ArrowFrame): boolean {
  return points.every(
    (point) =>
      point.x > frame.leftEdge && point.x < frame.rightEdge && point.y > -80,
  );
}

/**
 * Exit the phrase horizontally, turn down into the gutter, let the family
 * scribble, slide onto the pivot column, drop, then take the quarter turn that
 * puts the arrowhead exactly on the entry edge pointing right.
 *
 * Returns null when the family spent more room than the gap between the phrase
 * and the entry leaves, which the retry loop then re-rolls.
 */
function composePath(
  frame: ArrowFrame,
  family: ArrowFamily,
  random: () => number,
): Point[] | null {
  const pen = createPen(frame.startingPoint, frame.step);

  penStraight(pen, frame.exitRun);
  penTurnInRadians(pen, -Math.PI / 2, frame.radius);

  // Cross to the gutter before scribbling, so the detour always happens in
  // the margin instead of on top of whichever words the phrase sits among.
  slideSideways(pen, frame.pivot.x - pen.x, frame.radius);

  FAMILY_SHAPES[family](pen, frame, random);

  if (pen.y > frame.pivot.y - frame.reserve) return null;

  slideSideways(pen, frame.pivot.x - pen.x, frame.radius);

  // Snap onto the pivot column. The side-step lands within a fraction of a
  // pixel, and that much drift would put the arrowhead off the entry edge.
  pen.x = frame.pivot.x;
  pen.points[pen.points.length - 1] = { x: pen.x, y: pen.y };

  if (frame.pivot.y - pen.y < -frame.step) return null;

  penStraight(pen, Math.max(0, frame.pivot.y - pen.y));
  penTurnInRadians(pen, -Math.PI / 2, frame.radius);
  penStraight(pen, frame.runIn);

  pen.points[pen.points.length - 1] = {
    x: frame.endingPoint.x,
    y: frame.endingPoint.y,
  };

  return staysOnScreen(pen.points, frame) ? pen.points : null;
}

/** The arrow with no scribble: the shape the families are variations on. */
function composePlainPath(frame: ArrowFrame): Point[] {
  const pen = createPen(frame.startingPoint, frame.step);

  penStraight(pen, frame.exitRun);
  penTurnInRadians(pen, -Math.PI / 2, frame.radius);
  slideSideways(pen, frame.pivot.x - pen.x, frame.radius);
  pen.x = frame.pivot.x;
  pen.points[pen.points.length - 1] = { x: pen.x, y: pen.y };
  penStraight(pen, Math.max(0, frame.pivot.y - pen.y));
  penTurnInRadians(pen, -Math.PI / 2, frame.radius);
  penStraight(pen, frame.runIn);
  pen.points[pen.points.length - 1] = {
    x: frame.endingPoint.x,
    y: frame.endingPoint.y,
  };

  return pen.points;
}

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return function next(): number {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Builds the arrow for one frame and family. The pen already respects the cap,
 * so a rejection means the spline fitted through the samples overshot it;
 * retrying with new randomness usually finds a candidate. The last resort is
 * the unscribbled arrow, which is always smooth.
 *
 * Returns null when no honest arrow fits, so the caller can fall back to the
 * plain jump instead of drawing a bad path.
 */
export function buildArrowPath(request: BuildArrowRequest): BuiltArrow | null {
  const frame = frameFor(request);

  // The plain shape alone needs the entry to sit at least a pen diameter
  // below the phrase; anything less has no room for the turn onto the entry.
  if (frame.endingPoint.y - frame.startingPoint.y < 2 * frame.radius)
    return null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const random = mulberry32(request.seed + attempt * 2654435761);
    const points = composePath(frame, request.family, random);
    if (!points) continue;

    const segments = catmullRomSegments(points);
    const minTurnRadius = minimumTurnRadius(segments);

    if (minTurnRadius >= request.minTurnRadius) {
      return {
        segments,
        length: pathLength(segments),
        minTurnRadius,
        waypoints: points.length,
        family: request.family,
        usedPlainShape: false,
      };
    }
  }

  const plain = composePlainPath(frame);
  const segments = catmullRomSegments(plain);
  const plainRadius = minimumTurnRadius(segments);

  // Even the unscribbled arrow is too tight for this gutter, so there is no
  // honest arrow to draw.
  if (plainRadius < request.minTurnRadius) return null;

  return {
    segments,
    length: pathLength(segments),
    minTurnRadius: plainRadius,
    waypoints: plain.length,
    family: request.family,
    usedPlainShape: true,
  };
}

/** Tangent direction at the very end of the path, for aiming the arrowhead. */
export function endTangent(segments: CubicSegment[]): Point {
  return tangentAt(segments[segments.length - 1], 1);
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Closed arrowhead polygon with its tip at `tip`, aimed along `direction`. */
export function arrowHeadPath(tip: Point, direction: Point): string {
  const length = Math.hypot(direction.x, direction.y) || 1;
  const unit = { x: direction.x / length, y: direction.y / length };
  const normal = { x: -unit.y, y: unit.x };

  const base = {
    x: tip.x - unit.x * HEAD_LENGTH_PX,
    y: tip.y - unit.y * HEAD_LENGTH_PX,
  };
  const notch = {
    x: tip.x - unit.x * HEAD_LENGTH_PX * HEAD_NOTCH_PX,
    y: tip.y - unit.y * HEAD_LENGTH_PX * HEAD_NOTCH_PX,
  };

  const wingA = {
    x: base.x + normal.x * HEAD_HALF_WIDTH_PX,
    y: base.y + normal.y * HEAD_HALF_WIDTH_PX,
  };
  const wingB = {
    x: base.x - normal.x * HEAD_HALF_WIDTH_PX,
    y: base.y - normal.y * HEAD_HALF_WIDTH_PX,
  };

  return `M${round(tip.x)} ${round(tip.y)} L${round(wingA.x)} ${round(wingA.y)} L${round(notch.x)} ${round(notch.y)} L${round(wingB.x)} ${round(wingB.y)} Z`;
}
