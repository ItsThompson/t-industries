import { describe, it, expect, vi, afterEach } from 'vitest';
import { getUptime, getExperienceCycles, getSystemTime } from './terminal-display';

describe('terminal-display', () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	describe('getUptime', () => {
		it('returns a string matching X.XX YRS format', () => {
			const result = getUptime();
			expect(result).toMatch(/^\d+\.\d{2} YRS$/);
		});

		it('computes correct uptime for a known date', () => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date('2026-05-11T12:00:00Z'));

			const result = getUptime();
			const numericValue = parseFloat(result.replace(' YRS', ''));
			expect(numericValue).toBeGreaterThanOrEqual(21.0);
			expect(numericValue).toBeLessThan(21.1);
		});
	});

	describe('getExperienceCycles', () => {
		it('returns correct year count from 2019', () => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date('2026-05-11T12:00:00Z'));

			expect(getExperienceCycles()).toBe('EXP.CYCLES: 7');
		});

		it('format is EXP.CYCLES: {number}', () => {
			const result = getExperienceCycles();
			expect(result).toMatch(/^EXP\.CYCLES: \d+$/);
		});
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
