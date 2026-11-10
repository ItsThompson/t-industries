import { describe, it, expect } from 'vitest';
import { SOCIAL_LINKS } from './bio';

const STATIC_SVGS = new Set(Object.keys(import.meta.glob('/static/*.svg')));

describe('bio', () => {
	describe('social links', () => {
		it('resolves every mark to an svg in the static directory', () => {
			for (const link of SOCIAL_LINKS) {
				expect(
					STATIC_SVGS.has(`/static${link.markSrc}`),
					`${link.name} mark points at ${link.markSrc}`
				).toBe(true);
			}
		});

		it('gives every profile a distinct name and destination', () => {
			expect(new Set(SOCIAL_LINKS.map((link) => link.name)).size).toBe(SOCIAL_LINKS.length);
			expect(new Set(SOCIAL_LINKS.map((link) => link.href)).size).toBe(SOCIAL_LINKS.length);
		});
	});
});
