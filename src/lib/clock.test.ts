import { describe, it, expect, vi, afterEach } from 'vitest';

const START_TIME_MS = Date.parse('2024-01-01T00:00:00Z');

async function importClockAtStartTime() {
	vi.useFakeTimers();
	vi.setSystemTime(new Date(START_TIME_MS));
	vi.resetModules();
	const { now } = await import('./clock');
	return now;
}

describe('now', () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it('emits the current time when subscribed', async () => {
		const now = await importClockAtStartTime();
		const emissions: number[] = [];

		const unsubscribe = now.subscribe((value) => emissions.push(value));

		expect(emissions[emissions.length - 1]).toBe(START_TIME_MS);
		unsubscribe();
	});

	it('drives every subscriber from a single timer', async () => {
		const now = await importClockAtStartTime();
		const firstSubscriber = vi.fn();
		const secondSubscriber = vi.fn();

		const unsubscribeFirst = now.subscribe(firstSubscriber);
		const unsubscribeSecond = now.subscribe(secondSubscriber);
		expect(vi.getTimerCount()).toBe(1);

		vi.advanceTimersByTime(1000);

		const tickedTimeMs = START_TIME_MS + 1000;
		expect(firstSubscriber).toHaveBeenLastCalledWith(tickedTimeMs);
		expect(secondSubscriber).toHaveBeenLastCalledWith(tickedTimeMs);

		unsubscribeFirst();
		unsubscribeSecond();
	});

	it('stops ticking once the last subscriber leaves', async () => {
		const now = await importClockAtStartTime();
		const subscriber = vi.fn();

		const unsubscribeFirst = now.subscribe(subscriber);
		const unsubscribeSecond = now.subscribe(() => {});

		unsubscribeFirst();
		expect(vi.getTimerCount()).toBe(1);

		unsubscribeSecond();
		expect(vi.getTimerCount()).toBe(0);
	});
});
