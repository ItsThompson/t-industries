import { describe, it, expect, vi, afterEach } from 'vitest';
import { getSystemTime } from './terminal-display';

describe('terminal-display', () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	describe('getSystemTime', () => {
		it('returns time in SYS.TIME: HH:MM:SS UTC format', () => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date('2026-05-11T14:30:45Z'));

			expect(getSystemTime()).toBe('SYS.TIME: 14:30:45 UTC');
		});

		it('format matches SYS.TIME pattern', () => {
			const result = getSystemTime();
			expect(result).toMatch(/^SYS\.TIME: \d{2}:\d{2}:\d{2} UTC$/);
		});
	});
});
