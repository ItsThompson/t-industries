export interface Point {
  x: number;
  y: number;
}

export type ArrowFamily = "loop" | "curl" | "wobble" | "overshoot" | "wander";

export interface CubicSegment {
  p0: Point;
  c1: Point;
  c2: Point;
  p3: Point;
}

export interface ArrowFrame {
  startingPoint: Point;
  endingPoint: Point;
  minRadius: number;
  radius: number;
  step: number;
  runIn: number;
  pivot: Point;
  reserve: number;
  exitRun: number;
  leftEdge: number;
  rightEdge: number;
}

export interface BuiltArrow {
  segments: CubicSegment[];
  length: number;
  minTurnRadius: number;
  waypoints: number;
  family: ArrowFamily;
  usedPlainShape: boolean;
}
