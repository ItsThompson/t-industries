import { describe, expect, it } from 'vitest';
import { constrain } from './constrain';

const BOUNDS = { left: 20, right: 900, top: 40, bottom: 1800 };

describe('constrain', () => {
  it('preserves a valid position', () => {
    expect(constrain({ x: 500, y: 1000 }, BOUNDS)).toEqual({ x: 500, y: 1000 });
  });

  it('returns the nearest valid position without changing the other axis', () => {
    expect(constrain({ x: -100, y: 1000 }, BOUNDS)).toEqual({ x: 20, y: 1000 });
    expect(constrain({ x: 1500, y: 1000 }, BOUNDS)).toEqual({ x: 900, y: 1000 });
    expect(constrain({ x: 500, y: -100 }, BOUNDS)).toEqual({ x: 500, y: 40 });
    expect(constrain({ x: 500, y: 2000 }, BOUNDS)).toEqual({ x: 500, y: 1800 });
  });
});
