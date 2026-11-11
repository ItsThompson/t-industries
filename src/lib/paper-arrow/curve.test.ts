import { describe, expect, it } from 'vitest';
import { catmullRomSegments, minimumTurnRadius, pathData, pathLength, pointAt } from './curve';
import type { Point } from './types';

const HALF_PIXEL = 0.5;

describe('catmullRomSegments', () => {
  it('interpolates the endpoints exactly, so the path starts and ends where asked', () => {
    const points: Point[] = [
      { x: 0, y: 0 },
      { x: 40, y: 10 },
      { x: 90, y: -5 },
      { x: 130, y: 30 },
    ];
    const segments = catmullRomSegments(points);

    expect(segments).toHaveLength(points.length - 1);
    expect(pointAt(segments[0], 0).x).toBeCloseTo(points[0].x, 6);
    expect(pointAt(segments[0], 0).y).toBeCloseTo(points[0].y, 6);

    const last = segments[segments.length - 1];
    expect(pointAt(last, 1).x).toBeCloseTo(points[points.length - 1].x, 6);
    expect(pointAt(last, 1).y).toBeCloseTo(points[points.length - 1].y, 6);
  });

  it('emits collinear control points for a straight run', () => {
    const segments = catmullRomSegments([
      { x: 0, y: 20 },
      { x: 40, y: 20 },
      { x: 80, y: 20 },
      { x: 120, y: 20 },
    ]);

    for (const segment of segments) {
      for (const control of [segment.c1, segment.c2, segment.p3]) {
        // Control points land on the line within a twentieth of a pixel.
        expect(Math.abs(control.y - 20)).toBeLessThan(0.05);
      }
    }
  });

  it('reports an infinite turn radius for a straight run', () => {
    const segments = catmullRomSegments([
      { x: 0, y: 20 },
      { x: 40, y: 20 },
      { x: 80, y: 20 },
      { x: 120, y: 20 },
    ]);

    expect(minimumTurnRadius(segments)).toBe(Infinity);
  });

  it('measures the analytic curvature of a known cubic', () => {
    // A quarter circle as a single Bezier (the kappa approximation), whose
    // turn radius is known exactly.
    const RADIUS = 50;
    const KAPPA = 0.5522847498 * RADIUS;
    const quarterCircle = [
      {
        p0: { x: 0, y: RADIUS },
        c1: { x: KAPPA, y: RADIUS },
        c2: { x: RADIUS, y: KAPPA },
        p3: { x: RADIUS, y: 0 },
      },
    ];

    const radius = minimumTurnRadius(quarterCircle);

    expect(radius).toBeGreaterThanOrEqual(RADIUS * 0.98);
    expect(radius).toBeLessThanOrEqual(RADIUS * 1.02);
  });

  it('tracks a circle through dense samples, away from the reflected ends', () => {
    const RADIUS = 50;
    const points: Point[] = [];

    for (let degrees = -90; degrees <= 180; degrees += 5) {
      const angle = (degrees * Math.PI) / 180;
      points.push({
        x: 200 + RADIUS * Math.cos(angle),
        y: 200 + RADIUS * Math.sin(angle),
      });
    }

    // The reflected phantom points bend the first and last joints away from
    // the circle, so the interior is where the spline itself is measured.
    const interior = catmullRomSegments(points).slice(3, -3);
    const radius = minimumTurnRadius(interior);

    expect(radius).toBeGreaterThanOrEqual(RADIUS * 0.98);
    expect(radius).toBeLessThanOrEqual(RADIUS * 1.02);
  });
});

describe('pathLength', () => {
  it('matches the Euclidean length of a straight segment chain', () => {
    const segments = catmullRomSegments([
      { x: 0, y: 0 },
      { x: 30, y: 0 },
      { x: 60, y: 0 },
      { x: 90, y: 0 },
    ]);

    expect(pathLength(segments)).toBeCloseTo(90, 1);
  });
});

describe('pathData', () => {
  it('opens with a move and emits one curve per segment', () => {
    const segments = catmullRomSegments([
      { x: 0, y: 0 },
      { x: 40, y: 10 },
      { x: 90, y: -5 },
    ]);

    const data = pathData(segments);

    expect(data.startsWith('M')).toBe(true);
    expect(data.match(/C/g)).toHaveLength(segments.length);
  });
});
