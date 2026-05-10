import { describe, it, expect } from 'vitest';
import { experiences } from './experiences';
import type { Experience } from './experiences';

describe('experiences', () => {
	it('contains exactly 5 entries', () => {
		expect(experiences).toHaveLength(5);
	});

	it('each entry has all required fields', () => {
		const requiredKeys: (keyof Experience)[] = [
			'company',
			'role',
			'startDate',
			'endDate',
			'description'
		];

		experiences.forEach((entry) => {
			requiredKeys.forEach((key) => {
				expect(entry[key]).toBeDefined();
				expect(entry[key].length).toBeGreaterThan(0);
			});
		});
	});

	it('entries are in reverse-chronological order by end date', () => {
		const parseDate = (dateStr: string): Date => {
			if (dateStr === 'Present') return new Date();
			const [month, year] = dateStr.split(' ');
			const monthIndex = new Date(`${month} 1, 2000`).getMonth();
			return new Date(parseInt(year), monthIndex);
		};

		for (let i = 0; i < experiences.length - 1; i++) {
			const currentEnd = parseDate(experiences[i].endDate);
			const nextEnd = parseDate(experiences[i + 1].endDate);
			expect(currentEnd.getTime()).toBeGreaterThanOrEqual(nextEnd.getTime());
		}
	});

	it('first entry is Amazon (Veeqo) as the most recent role', () => {
		expect(experiences[0].company).toBe('Amazon (Veeqo)');
		expect(experiences[0].endDate).toBe('Present');
	});

	it('last entry is Coding For Good as the earliest role', () => {
		expect(experiences[experiences.length - 1].company).toBe('Coding For Good');
	});
});
