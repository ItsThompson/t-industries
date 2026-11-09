import { describe, it, expect, afterEach, vi } from 'vitest';
import {
	HIGHLIGHT_PARAM,
	highlightHref,
	prefersReducedMotion,
	readHighlightTarget,
	revealElement,
	scrollToCenter
} from './deep-links';

describe('highlightHref', () => {
	it('names the target element in the query string', () => {
		expect(highlightHref('/experience', 'amazon')).toBe('/experience?highlight=amazon');
	});

	it('encodes targets that would break the query string', () => {
		expect(highlightHref('/ethos', 'continuous learning')).toBe(
			'/ethos?highlight=continuous%20learning'
		);
	});

	it('uses the documented query parameter name', () => {
		expect(HIGHLIGHT_PARAM).toBe('highlight');
		expect(highlightHref('/ethos', 'x')).toContain(`${HIGHLIGHT_PARAM}=x`);
	});
});

describe('readHighlightTarget', () => {
	it('reads the target from search params', () => {
		expect(readHighlightTarget(new URLSearchParams('?highlight=msd'))).toBe('msd');
	});

	it('treats a missing param as no target', () => {
		expect(readHighlightTarget(new URLSearchParams(''))).toBeNull();
	});

	it('treats a blank param as no target', () => {
		expect(readHighlightTarget(new URLSearchParams('?highlight=%20'))).toBeNull();
	});

	it('tolerates an absent search params object', () => {
		expect(readHighlightTarget(undefined)).toBeNull();
		expect(readHighlightTarget(null)).toBeNull();
	});

	it('ignores unrelated params', () => {
		expect(readHighlightTarget(new URLSearchParams('?utm=email'))).toBeNull();
	});
});

describe('scrollToCenter', () => {
	afterEach(() => {
		vi.restoreAllMocks();
		document.body.innerHTML = '';
	});

	function mountTarget(id: string): HTMLElement {
		const element = document.createElement('div');
		element.id = id;
		document.body.appendChild(element);
		return element;
	}

	it('centers the element with a smooth scroll', () => {
		const element = mountTarget('experience-amazon');
		const scrollIntoView = vi.fn();
		element.scrollIntoView = scrollIntoView;

		scrollToCenter('experience-amazon');

		expect(scrollIntoView).toHaveBeenCalledWith({
			block: 'center',
			inline: 'nearest',
			behavior: 'smooth'
		});
	});

	it('jumps without animation when the user asks for reduced motion', () => {
		const element = mountTarget('ethos-continuous-learning');
		const scrollIntoView = vi.fn();
		element.scrollIntoView = scrollIntoView;
		vi.stubGlobal(
			'matchMedia',
			vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })
		);

		scrollToCenter('ethos-continuous-learning');

		expect(scrollIntoView).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'auto' }));
		vi.unstubAllGlobals();
	});

	it('does nothing when the target is not on the page', () => {
		expect(() => scrollToCenter('experience-missing')).not.toThrow();
	});
});

describe('revealElement', () => {
	afterEach(() => {
		vi.restoreAllMocks();
		document.body.innerHTML = '';
	});

	it('centers on the next frame, after the layout resets the scroll region', async () => {
		const element = document.createElement('div');
		element.id = 'experience-msd';
		document.body.appendChild(element);
		const scrollIntoView = vi.fn();
		element.scrollIntoView = scrollIntoView;

		revealElement('experience-msd');

		expect(scrollIntoView).not.toHaveBeenCalled();

		await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

		expect(scrollIntoView).toHaveBeenCalledWith(expect.objectContaining({ block: 'center' }));
	});
});

describe('prefersReducedMotion', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('reports the reduced-motion preference', () => {
		vi.stubGlobal(
			'matchMedia',
			vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })
		);

		expect(prefersReducedMotion()).toBe(true);
	});

	it('assumes motion is allowed when the browser cannot report it', () => {
		vi.stubGlobal('matchMedia', undefined);

		expect(prefersReducedMotion()).toBe(false);
	});
});
