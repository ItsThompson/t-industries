import type { Bounds, Point } from './types';

export function constrain(point: Point, bounds: Bounds): Point {
  return {
    x: Math.max(bounds.left, Math.min(bounds.right, point.x)),
    y: Math.max(bounds.top, Math.min(bounds.bottom, point.y)),
  };
}
