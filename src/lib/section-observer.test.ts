import { describe, it, expect } from 'vitest';
import { selectActiveSection } from './section-observer';

describe('selectActiveSection', () => {
	it('returns empty string when no sections are visible', () => {
		const visibilityMap = new Map([
			['identity', 0],
			['experience', 0],
			['projects', 0]
		]);
		const getRect = () => ({ top: 0 }) as DOMRect;

		expect(selectActiveSection(visibilityMap, getRect)).toBe('');
	});

	it('returns the only visible section', () => {
		const visibilityMap = new Map([
			['identity', 0],
			['experience', 0.5],
			['projects', 0]
		]);
		const getRect = (id: string) => {
			if (id === 'experience') return { top: 200 } as DOMRect;
			return { top: 1000 } as DOMRect;
		};

		expect(selectActiveSection(visibilityMap, getRect)).toBe('experience');
	});

	it('returns the section closest to the top when multiple are visible', () => {
		const visibilityMap = new Map([
			['identity', 0.3],
			['experience', 0.8],
			['projects', 0.1]
		]);
		const getRect = (id: string) => {
			const rects: Record<string, DOMRect> = {
				identity: { top: -50 } as DOMRect,
				experience: { top: 300 } as DOMRect,
				projects: { top: 800 } as DOMRect
			};
			return rects[id] ?? null;
		};

		expect(selectActiveSection(visibilityMap, getRect)).toBe('identity');
	});

	it('handles negative top values (section scrolled above viewport)', () => {
		const visibilityMap = new Map([
			['identity', 0.1],
			['experience', 0.6]
		]);
		const getRect = (id: string) => {
			const rects: Record<string, DOMRect> = {
				identity: { top: -500 } as DOMRect,
				experience: { top: 100 } as DOMRect
			};
			return rects[id] ?? null;
		};

		// identity has the smallest top value, so it wins
		expect(selectActiveSection(visibilityMap, getRect)).toBe('identity');
	});

	it('skips sections where getRect returns null', () => {
		const visibilityMap = new Map([
			['identity', 0.5],
			['experience', 0.5]
		]);
		const getRect = (id: string) => {
			if (id === 'identity') return null;
			return { top: 200 } as DOMRect;
		};

		expect(selectActiveSection(visibilityMap, getRect)).toBe('experience');
	});

	it('returns empty string when visibilityMap is empty', () => {
		const visibilityMap = new Map<string, number>();
		const getRect = () => ({ top: 0 }) as DOMRect;

		expect(selectActiveSection(visibilityMap, getRect)).toBe('');
	});

	it('ignores sections with exactly zero ratio', () => {
		const visibilityMap = new Map([
			['identity', 0],
			['experience', 0.001]
		]);
		const getRect = (id: string) => {
			const rects: Record<string, DOMRect> = {
				identity: { top: 0 } as DOMRect,
				experience: { top: 500 } as DOMRect
			};
			return rects[id] ?? null;
		};

		expect(selectActiveSection(visibilityMap, getRect)).toBe('experience');
	});

	it('prefers topmost section regardless of intersection ratio', () => {
		const visibilityMap = new Map([
			['identity', 0.1],
			['experience', 0.9],
			['projects', 0.5]
		]);
		const getRect = (id: string) => {
			const rects: Record<string, DOMRect> = {
				identity: { top: 50 } as DOMRect,
				experience: { top: 600 } as DOMRect,
				projects: { top: 1200 } as DOMRect
			};
			return rects[id] ?? null;
		};

		// identity has lowest ratio but topmost position
		expect(selectActiveSection(visibilityMap, getRect)).toBe('identity');
	});
});
