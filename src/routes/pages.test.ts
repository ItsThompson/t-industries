import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import type { ComponentType } from 'svelte';
import HomePage from './(site)/+page.svelte';
import ExperiencePage from './(site)/experience/+page.svelte';
import ProjectsPage from './(site)/projects/+page.svelte';
import EthosPage from './(site)/ethos/+page.svelte';
import OnePagerPage from './one-pager/+page.svelte';
import { resetPageRoute, setPageRoute } from '$lib/__mocks__/app-stores';
import { BIO_NAME } from '$lib/bio';
import { canonicalUrl } from '$lib/seo';

interface RouteCase {
	component: ComponentType;
	props: Record<string, unknown>;
	path: string;
	expectedHeading: string;
}

const ROUTES: RouteCase[] = [
	{ component: HomePage, props: {}, path: '/', expectedHeading: BIO_NAME },
	{ component: ExperiencePage, props: {}, path: '/experience', expectedHeading: 'EXPERIENCE' },
	{
		component: ProjectsPage,
		props: { data: { projects: [] } },
		path: '/projects',
		expectedHeading: 'PROJECTS'
	},
	{ component: EthosPage, props: {}, path: '/ethos', expectedHeading: 'ETHOS' },
	{
		component: OnePagerPage,
		props: {},
		path: '/one-pager',
		expectedHeading: BIO_NAME
	}
];

const PAGE_SOURCES = import.meta.glob('/src/routes/**/+page.svelte', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

function headDescription(): string {
	return (
		document.head.querySelector('meta[name="description"]')?.getAttribute('content') ?? ''
	);
}

function renderRoute(route: RouteCase): ReturnType<typeof render> {
	setPageRoute(route.path);
	return render(route.component, { props: route.props });
}

describe('route pages', () => {
	beforeEach(() => {
		// The R&D list fetches remote data on mount; reject so the render is deterministic and offline.
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline test')));
		vi.spyOn(console, 'error').mockImplementation(() => undefined);
	});

	afterEach(() => {
		cleanup();
		resetPageRoute();
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	describe.each(ROUTES)('$path', (route) => {
		it('gives the page exactly one h1, naming the page subject', () => {
			const { container } = renderRoute(route);

			const headings = Array.from(container.querySelectorAll('h1'));
			expect(headings).toHaveLength(1);
			expect(headings[0].textContent).toContain(route.expectedHeading);
		});

		it('never skips a heading level when descending, so the outline stays readable', () => {
			const { container } = renderRoute(route);

			const levels = Array.from(
				container.querySelectorAll('h1, h2, h3, h4, h5, h6')
			).map((heading) => Number(heading.tagName.slice(1)));

			expect(Math.min(...levels)).toBe(1);
			for (let index = 1; index < levels.length; index += 1) {
				expect(levels[index] - levels[index - 1]).toBeLessThanOrEqual(1);
			}
		});

		it('declares a description short enough that search results show it in full', () => {
			renderRoute(route);

			expect(headDescription().length).toBeGreaterThanOrEqual(70);
			expect(headDescription().length).toBeLessThanOrEqual(160);
		});

		it('canonicalises to its own route', () => {
			renderRoute(route);

			expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
				canonicalUrl(route.path)
			);
		});
	});

	it('gives every page a distinct title and description so none compete for one query', () => {
		const titles = new Set<string>();
		const descriptions = new Set<string>();

		for (const route of ROUTES) {
			const { unmount } = renderRoute(route);
			titles.add(document.title);
			descriptions.add(headDescription());
			unmount();
		}

		expect(titles.size).toBe(ROUTES.length);
		expect(descriptions.size).toBe(ROUTES.length);
	});

	it('names the person in every page title', () => {
		for (const route of ROUTES) {
			const { unmount } = renderRoute(route);
			expect(document.title).toContain(BIO_NAME);
			unmount();
		}
	});

	it('puts the person first in the home title, so a name query matches it', () => {
		const { unmount } = renderRoute(ROUTES[0]);

		expect(document.title.startsWith(BIO_NAME)).toBe(true);
		unmount();
	});

	it('declares head metadata in every page file, so no route ships without it', () => {
		const pageSources = Object.entries(PAGE_SOURCES);

		expect(pageSources.length).toBe(ROUTES.length);
		for (const [filePath, source] of pageSources) {
			expect(source, `${filePath} must render <Seo>`).toMatch(/<Seo[\s\S]*?title=/);
			expect(source, `${filePath} must set a description`).toMatch(/<Seo[\s\S]*?description=/);
		}
	});
});
