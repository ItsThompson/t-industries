export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Bounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface SpringProfile {
  stiffness: number;
  damping: number;
}

export interface Drag {
  pointerId: number;
  pointerStart: Point;
  objectStart: Point;
  pointer: Point;
}
