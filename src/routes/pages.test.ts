import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import type { ComponentType } from 'svelte';
import HomePage from './+page.svelte';
import ExperiencePage from './experience/+page.svelte';
import ProjectsPage from './projects/+page.svelte';
import EthosPage from './ethos/+page.svelte';
import { BIO_NAME } from '$lib/bio';
import { canonicalUrl, PAGES, type PageKey } from '$lib/seo';

interface RouteCase {
	key: PageKey;
	component: ComponentType;
	props: Record<string, unknown>;
	expectedHeading: string;
}

const ROUTES: RouteCase[] = [
	{ key: 'home', component: HomePage, props: {}, expectedHeading: BIO_NAME },
	{ key: 'experience', component: ExperiencePage, props: {}, expectedHeading: 'EXPERIENCE' },
	{
		key: 'projects',
		component: ProjectsPage,
		props: { data: { projects: [] } },
		expectedHeading: 'PROJECTS'
	},
	{ key: 'ethos', component: EthosPage, props: {}, expectedHeading: 'ETHOS' }
];

describe.each(ROUTES)('$key page', ({ key, component, props, expectedHeading }) => {
	beforeEach(() => {
		// The R&D list fetches remote data on mount; reject so the render is deterministic and offline.
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline test')));
		vi.spyOn(console, 'error').mockImplementation(() => undefined);
	});

	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	it('gives every page exactly one h1, naming the page subject', () => {
		const { container } = render(component, { props });

		const headings = Array.from(container.querySelectorAll('h1'));
		expect(headings).toHaveLength(1);
		expect(headings[0].textContent).toContain(expectedHeading);
	});

	it('never skips a heading level when descending, so the outline stays readable', () => {
		const { container } = render(component, { props });

		const levels = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6')).map((heading) =>
			Number(heading.tagName.slice(1))
		);

		expect(Math.min(...levels)).toBe(1);
		for (let index = 1; index < levels.length; index += 1) {
			expect(levels[index] - levels[index - 1]).toBeLessThanOrEqual(1);
		}
	});

	it('sets the title and canonical URL declared for the page', () => {
		render(component, { props });

		expect(document.title).toBe(PAGES[key].title);
		expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
			canonicalUrl(PAGES[key].path)
		);
		expect(
			document.head.querySelector('meta[name="description"]')?.getAttribute('content')
		).toBe(PAGES[key].description);
	});
});
