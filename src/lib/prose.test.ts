import { describe, it, expect } from 'vitest';
import { joinAsProse, proseSeparatorAfter } from './prose';

describe('proseSeparatorAfter', () => {
	it('puts a comma after every item but the last', () => {
		expect(proseSeparatorAfter(0, 4)).toBe(', ');
		expect(proseSeparatorAfter(1, 4)).toBe(', ');
	});

	it('puts ", and " before the last item', () => {
		expect(proseSeparatorAfter(2, 4)).toBe(', and ');
	});

	it('puts nothing after the last item', () => {
		expect(proseSeparatorAfter(3, 4)).toBe('');
	});

	it('puts nothing after a single item, so no dangling conjunction appears', () => {
		expect(proseSeparatorAfter(0, 1)).toBe('');
	});
});

describe('joinAsProse', () => {
	it('reads three items as one sentence, with the conjunction before the last', () => {
		expect(joinAsProse(['Hong Kong', 'Taipei', 'Chengdu'])).toBe(
			'Hong Kong, Taipei, and Chengdu'
		);
	});

	it('leaves a single item unpunctuated', () => {
		expect(joinAsProse(['Swansea'])).toBe('Swansea');
	});

	it('returns an empty string for no items', () => {
		expect(joinAsProse([])).toBe('');
	});

	it('keeps the serial comma for two items', () => {
		expect(joinAsProse(['A', 'B'])).toBe('A, and B');
	});
});
