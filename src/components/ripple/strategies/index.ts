import { bloomStrategy } from './bloom';
import { blobStrategy } from './blob';
import { causticStrategy } from './caustic';
import { ditherStrategy } from './dither';
import { petalStrategy } from './petal';
import { ringStrategy } from './ring';
import type { RippleStrategy } from '../types';

/** Every shape a press can draw. Add or remove here to change the mix. */
export const RIPPLE_STRATEGIES: readonly RippleStrategy[] = [
	ringStrategy,
	bloomStrategy,
	blobStrategy,
	petalStrategy,
	causticStrategy,
	ditherStrategy
];
