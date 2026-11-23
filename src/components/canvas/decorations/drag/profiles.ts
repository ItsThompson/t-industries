import type { SpringProfile } from './types';

export const DECORATION_SPRINGS = {
  macbook: { stiffness: 0.045, damping: 0.27 },
  dumbbell: { stiffness: 0.035, damping: 0.25 },
  beagle: { stiffness: 0.09, damping: 0.36 },
  brain: { stiffness: 0.11, damping: 0.39 },
  headphones: { stiffness: 0.12, damping: 0.4 },
  skateboard: { stiffness: 0.065, damping: 0.31 },
  'fidget-cube': { stiffness: 0.13, damping: 0.42 },
  'rubiks-cube': { stiffness: 0.1, damping: 0.37 },
  'electric-guitar': { stiffness: 0.05, damping: 0.28 },
  keyboard: { stiffness: 0.075, damping: 0.33 },
} satisfies Record<string, SpringProfile>;
