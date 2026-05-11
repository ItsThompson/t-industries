import { describe, it, expect, vi, afterEach } from 'vitest';
import { identity, calculateAge, yearsOfExperience } from './identity';

describe('identity', () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	describe('identity config', () => {
		it('has birthday set to 2005-05-10', () => {
			expect(identity.birthday).toBe('2005-05-10');
		});

		it('has careerStartYear set to 2019', () => {
			expect(identity.careerStartYear).toBe(2019);
		});

		it('has unitSerial set to TI-0510', () => {
			expect(identity.unitSerial).toBe('TI-0510');
		});

		it('has archiveRef set to ARC-2019-FWD', () => {
			expect(identity.archiveRef).toBe('ARC-2019-FWD');
		});

		it('has manufacturingDate set to MFG: LOT-05-10', () => {
			expect(identity.manufacturingDate).toBe('MFG: LOT-05-10');
		});
	});

	describe('calculateAge', () => {
		it('returns a 2-decimal-place value without options', () => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date('2026-05-11T12:00:00Z'));

			const age = calculateAge();
			expect(age).toBeGreaterThanOrEqual(21.0);
			expect(age).toBeLessThan(21.1);
		});

		it('returns the floored year count when floored option is true', () => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date('2026-05-11T12:00:00Z'));

			const age = calculateAge({ floored: true });
			expect(age).toBe(21);
		});

		it('returns an integer when floored', () => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date('2026-12-15T12:00:00Z'));

			const age = calculateAge({ floored: true });
			expect(Number.isInteger(age)).toBe(true);
		});
	});

	describe('yearsOfExperience', () => {
		it('returns current year minus career start year', () => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date('2026-05-11T12:00:00Z'));

			expect(yearsOfExperience()).toBe(7);
		});

		it('returns a positive integer', () => {
			const result = yearsOfExperience();
			expect(result).toBeGreaterThan(0);
			expect(Number.isInteger(result)).toBe(true);
		});
	});
});
