import { describe, it, expect } from 'vitest';
import { experienceAnchorId, experiences, highlights } from './experiences';

describe('experiences', () => {
	it('contains exactly 5 entries', () => {
		expect(experiences).toHaveLength(5);
	});

	it('each entry has all required fields', () => {
		type TextField =
			| 'id'
			| 'company'
			| 'role'
			| 'startDate'
			| 'endDate'
			| 'description'
			| 'accent';

		const requiredKeys: TextField[] = [
			'id',
			'company',
			'role',
			'startDate',
			'endDate',
			'description',
			'accent'
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
		expect(experiences[0].endDate).toBe('Sep 2026');
	});

	it('last entry is Coding For Good as the earliest role', () => {
		expect(experiences[experiences.length - 1].company).toBe('Coding For Good');
	});

	it('gives every entry a unique id, so a deep link can name exactly one entry', () => {
		const ids = experiences.map((entry) => entry.id);
		expect(new Set(ids).size).toBe(experiences.length);
	});

	it('builds anchor ids that cannot collide with another entry', () => {
		const anchors = experiences.map((entry) => experienceAnchorId(entry.id));
		expect(new Set(anchors).size).toBe(experiences.length);
		expect(anchors).toContain('experience-amazon');
	});

	it('gives every entry an accent color the highlight can render', () => {
		experiences.forEach((entry) => {
			expect(entry.accent).toMatch(/^#[0-9A-Fa-f]{6}$/);
		});
	});
});

describe('highlights', () => {
	it('lists at least one entry, so the canvas work section is never empty', () => {
		expect(highlights().length).toBeGreaterThan(0);
	});

	it('gives every highlighted entry a summary line to show', () => {
		highlights().forEach((entry) => {
			expect(entry.highlightSummary?.trim().length ?? 0).toBeGreaterThan(0);
		});
	});

	it('keeps the timeline order of the full list', () => {
		const highlighted = highlights();
		const positions = highlighted.map((entry) => experiences.indexOf(entry));

		expect(positions).toEqual([...positions].sort((a, b) => a - b));
	});

	it('leaves the entries the canvas does not list out of the result', () => {
		const highlighted = highlights().map((entry) => entry.id);

		experiences
			.filter((entry) => !entry.highlight)
			.forEach((entry) => expect(highlighted).not.toContain(entry.id));
	});

	it('lists the three roles the page claims', () => {
		expect(highlights().map((entry) => entry.id)).toEqual(['amazon', 'criisp', 'msd']);
	});
});
