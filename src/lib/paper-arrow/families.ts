import { clamp } from "./curve";
import type { ArrowFrame, ArrowFamily, Point } from "./types";

export interface Pen {
  step: number;
  x: number;
  y: number;
  headingInRadians: number;
  points: Point[];
}

export type FamilyShape = (
  pen: Pen,
  frame: ArrowFrame,
  random: () => number,
) => void;

export function createPen(start: Point, step: number): Pen {
  return {
    step,
    x: start.x,
    y: start.y,
    headingInRadians: Math.PI,
    points: [{ x: start.x, y: start.y }],
  };
}

export function penStraight(pen: Pen, length: number): void {
  if (!(length > 0.01)) return;

  const parts = Math.max(1, Math.round(length / pen.step));
  const dx = Math.cos(pen.headingInRadians) * (length / parts);
  const dy = Math.sin(pen.headingInRadians) * (length / parts);

  for (let part = 0; part < parts; part += 1) {
    pen.x += dx;
    pen.y += dy;
    pen.points.push({ x: pen.x, y: pen.y });
  }
}

/** A positive angle turns counter-clockwise on screen. */
export function penTurnInRadians(
  pen: Pen,
  angle: number,
  radius: number,
): void {
  if (Math.abs(angle) < 1e-4) return;

  const starting = pen.headingInRadians;
  const sign = Math.sign(angle);
  const parts = Math.max(2, Math.round((Math.abs(angle) * radius) / pen.step));
  const centre = {
    x: pen.x - radius * Math.sin(starting) * sign,
    y: pen.y + radius * Math.cos(starting) * sign,
  };

  for (let part = 1; part <= parts; part += 1) {
    const heading = starting + angle * (part / parts);
    pen.headingInRadians = heading;
    pen.x = centre.x + radius * Math.sin(heading) * sign;
    pen.y = centre.y - radius * Math.cos(heading) * sign;
    pen.points.push({ x: pen.x, y: pen.y });
  }
}

export function budgetFor(frame: ArrowFrame, pen: Pen | null): number {
  const from = pen ? pen.y : frame.startingPoint.y + frame.radius;
  return Math.max(0, frame.pivot.y - frame.reserve - from);
}

export function arcsThatFit(
  frame: ArrowFrame,
  pen: Pen | null,
  cycles: number,
): number {
  const room = Math.floor(budgetFor(frame, pen) / (frame.radius * 2.4));
  return clamp(Math.min(cycles, room), 1, 4);
}

export function slideSideways(pen: Pen, delta: number, radius: number): void {
  let remaining = delta;

  for (let pass = 0; pass < 2 && Math.abs(remaining) > 0.5; pass += 1) {
    // Widen the radius to swallow the rest of the offset in one S. A phrase
    // in the middle of a line sits hundreds of pixels from the gutter, and
    // stacking several tight S-curves to cross the column costs far more
    // height than the space between the phrase and the entry has.
    const width = Math.max(radius, Math.abs(remaining) / 3.9);
    const magnitude = Math.min(Math.abs(remaining), 3.9 * width);
    const angle = Math.acos(clamp(1 - magnitude / (2 * width), -1, 1));
    const direction = Math.sign(remaining);

    penTurnInRadians(pen, -direction * angle, width);
    penTurnInRadians(pen, direction * angle, width);
    remaining -= direction * magnitude;
  }
}

export const FAMILY_SHAPES: Record<ArrowFamily, FamilyShape> = {
  loop(pen, frame, random) {
    const budget = budgetFor(frame, pen);
    const room = Math.min((pen.x - frame.leftEdge) * 0.3, budget * 0.26);
    const radius = Math.max(frame.minRadius, room * (0.55 + random() * 0.4));
    const direction = random() < 0.5 ? 1 : -1;

    penStraight(pen, budget * (0.2 + random() * 0.15));
    penTurnInRadians(pen, direction * Math.PI * 2, radius);
    penStraight(pen, budget * (0.03 + random() * 0.06));
  },

  curl(pen, frame, random) {
    const budget = budgetFor(frame, pen);
    const share = Math.PI * (0.6 + random() * 0.9);
    const wide = Math.min((pen.x - frame.leftEdge) * 0.3, budget * 0.4);
    const tight = clamp(
      wide * (0.38 + random() * 0.22),
      frame.radius * 0.75,
      wide * 0.72,
    );

    penStraight(pen, budget * (0.14 + random() * 0.14));
    penTurnInRadians(pen, share, wide);
    penTurnInRadians(pen, Math.PI * 2 - share, tight);
    penStraight(pen, budget * (0.03 + random() * 0.05));
  },

  wobble(pen, frame, random) {
    const pairs = arcsThatFit(frame, pen, 2 + Math.floor(random() * 3));
    const run = budgetFor(frame, pen) / (pairs + 1);

    for (let index = 0; index < pairs; index += 1) {
      const swing = (0.45 + random() * 0.5) * (random() < 0.5 ? 1 : -1);
      penTurnInRadians(pen, swing, frame.radius);
      penTurnInRadians(pen, -swing, frame.radius);
      penStraight(pen, run * (0.4 + random() * 0.3));
    }
  },

  overshoot(pen, frame, random) {
    const room = clamp(frame.radius * 0.7, frame.minRadius, 28);
    const past = 14 + random() * 22;

    penStraight(pen, frame.pivot.y + past - pen.y);
    penTurnInRadians(pen, Math.PI, room);
    penStraight(pen, past + frame.reserve);
    penTurnInRadians(pen, Math.PI, room);
  },

  wander(pen, frame, random) {
    const cycles = arcsThatFit(frame, pen, 2 + Math.floor(random() * 3));
    const run = budgetFor(frame, pen) / (cycles + 1);

    for (let index = 0; index < cycles; index += 1) {
      const swing = (0.5 + random() * 0.9) * (random() < 0.5 ? 1 : -1);
      penTurnInRadians(pen, swing, frame.radius);
      penStraight(pen, run * (0.35 + random() * 0.4));
      penTurnInRadians(pen, -swing, frame.radius);
      penStraight(pen, run * (0.15 + random() * 0.25));
    }
  },
};
