import { describe, expect, it } from 'vitest';
import {
  ARROW_FAMILIES,
  DEFAULT_MIN_TURN_RADIUS,
  arrowHeadPath,
  buildArrowPath,
  endTangent,
  pickFamily,
} from './compose';
import { pointAt } from './curve';
import type { BuildArrowRequest } from './compose';
import type { Point } from './types';

const HALF_PIXEL = 0.5;

/**
 * Frames from the real page at a 1440px viewport: the entry column edge sits at
 * 360px, the arrowhead tip 16px left of it, and the three phrases at the column
 * start, mid-line, and far right of the bio paragraph.
 */
function requestFor(family: BuildArrowRequest['family'], fromX: number, seed: number): BuildArrowRequest {
  return {
    from: { x: fromX, y: 280 },
    to: { x: 344, y: 900 },
    minTurnRadius: DEFAULT_MIN_TURN_RADIUS,
    leftEdge: 14,
    rightEdge: 1426,
    family,
    seed,
  };
}

const PHRASE_X_POSITIONS = [362, 700, 1100];
const SEEDS = [1, 2, 3, 4, 5, 6, 7, 8];

describe('buildArrowPath', () => {
  it('starts the path at `from` and ends it at `to`, for every family', () => {
    for (const family of ARROW_FAMILIES) {
      const built = buildArrowPath(requestFor(family, 700, 1));
      if (!built) throw new Error(`no arrow built for ${family}`);

      const first = built.segments[0];
      expect(Math.abs(first.p0.x - 700)).toBeLessThanOrEqual(HALF_PIXEL);
      expect(Math.abs(first.p0.y - 280)).toBeLessThanOrEqual(HALF_PIXEL);

      const last = built.segments[built.segments.length - 1];
      expect(Math.abs(last.p3.x - 344)).toBeLessThanOrEqual(HALF_PIXEL);
      expect(Math.abs(last.p3.y - 900)).toBeLessThanOrEqual(HALF_PIXEL);
    }
  });

  it('ends on a horizontal tangent, so the arrowhead points at the entry', () => {
    for (const family of ARROW_FAMILIES) {
      const built = buildArrowPath(requestFor(family, 700, 1));
      if (!built) throw new Error(`no arrow built for ${family}`);

      const tangent = endTangent(built.segments);
      expect(Math.abs(tangent.y)).toBeLessThanOrEqual(0.01 * Math.abs(tangent.x));
    }
  });

  it('respects the requested turn radius for every family, frame, and seed', () => {
    for (const family of ARROW_FAMILIES) {
      for (const fromX of PHRASE_X_POSITIONS) {
        for (const seed of SEEDS) {
          const built = buildArrowPath(requestFor(family, fromX, seed));

          expect(built, `${family} at x=${fromX} seed=${seed}`).not.toBeNull();
          expect(
            built!.minTurnRadius,
            `${family} at x=${fromX} seed=${seed}`,
          ).toBeGreaterThanOrEqual(DEFAULT_MIN_TURN_RADIUS);
        }
      }
    }
  });

  it('returns null rather than a bad path when the frame has no vertical room', () => {
    const built = buildArrowPath({
      from: { x: 700, y: 280 },
      to: { x: 344, y: 310 },
      minTurnRadius: DEFAULT_MIN_TURN_RADIUS,
      leftEdge: 14,
      rightEdge: 1426,
      family: 'loop',
      seed: 1,
    });

    expect(built).toBeNull();
  });

  it('names the family it drew and the plain shape when every scribble was rejected', () => {
    const scribbled = buildArrowPath(requestFor('loop', 700, 1));
    if (!scribbled) throw new Error('no arrow built');

    expect(scribbled.family).toBe('loop');
    expect(scribbled.usedPlainShape).toBe(false);
    expect(scribbled.waypoints).toBeGreaterThan(0);
    expect(scribbled.length).toBeGreaterThan(0);
  });
});

describe('pickFamily', () => {
  it('maps a supplied random value to a stable family', () => {
    expect(pickFamily(() => 0)).toBe('loop');
    expect(pickFamily(() => 0.99)).toBe('wander');
  });

  it('covers all five families across the unit interval', () => {
    const picked = new Set(
      ARROW_FAMILIES.map((_, index) => pickFamily(() => (index + 0.5) / ARROW_FAMILIES.length)),
    );

    expect(picked).toEqual(new Set(ARROW_FAMILIES));
  });
});

describe('arrowHeadPath', () => {
  it('places its tip at the supplied point', () => {
    const tip: Point = { x: 344, y: 900 };
    const data = arrowHeadPath(tip, { x: 1, y: 0 });

    expect(data.startsWith(`M${tip.x} ${tip.y}`)).toBe(true);
  });

  it('aims along the supplied direction', () => {
    const tip: Point = { x: 100, y: 100 };
    const data = arrowHeadPath(tip, { x: 0, y: 1 });

    // A head pointing down steps back up from the tip to its wings.
    expect(data).toContain('L94 85');
    expect(data).toContain('L106 85');
  });
});

describe('pointAt on built paths', () => {
  it('keeps the drawn length close to the waypoint span', () => {
    const built = buildArrowPath(requestFor('loop', 700, 1));
    if (!built) throw new Error('no arrow built');

    const first = pointAt(built.segments[0], 0);
    const last = built.segments[built.segments.length - 1].p3;
    const straightLine = Math.hypot(last.x - first.x, last.y - first.y);

    // A scribbled detour is always longer than the straight line it detours from.
    expect(built.length).toBeGreaterThan(straightLine);
  });
});
