import { describe, it, expect } from 'vitest';
import { ACCENTS } from './accents';
import { THEME_COLORS } from './theme';

describe('accents', () => {
	it('takes the ethos accent from the theme, so the two cannot drift', () => {
		expect(ACCENTS.ethos).toBe(THEME_COLORS.primary);
	});

	it('defines every accent as a 6-digit hex color', () => {
		Object.values(ACCENTS).forEach((accent) => {
			expect(accent).toMatch(/^#[0-9A-Fa-f]{6}$/);
		});
	});

	it('keeps each brand accent distinct from the site accent', () => {
		expect(ACCENTS.amazon).not.toBe(ACCENTS.ethos);
		expect(ACCENTS.msd).not.toBe(ACCENTS.ethos);
		expect(ACCENTS.criisp).not.toBe(ACCENTS.ethos);
	});

	it('takes the prose accent from the body text, so it reads as plain copy', () => {
		expect(ACCENTS.prose).toBe(THEME_COLORS.secondary[100]);
	});
});
