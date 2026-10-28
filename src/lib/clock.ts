import { readable } from 'svelte/store';

const TICK_INTERVAL_MS = 1000;

/**
 * Wall-clock time in epoch milliseconds. One timer serves every subscriber, so
 * two mounted clock displays cannot drift apart or run duplicate intervals.
 */
export const now = readable(Date.now(), (set) => {
	const interval = setInterval(() => set(Date.now()), TICK_INTERVAL_MS);
	return () => clearInterval(interval);
});
