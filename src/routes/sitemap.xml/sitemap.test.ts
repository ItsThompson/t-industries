import { describe, it, expect } from 'vitest';
import { GET } from './+server';
import { canonicalUrl, routePathFromFile } from '$lib/seo';

const PAGE_FILES = import.meta.glob('/src/routes/**/+page.svelte');

const EXPECTED_LOCATIONS = Object.keys(PAGE_FILES)
	.map(routePathFromFile)
	.map(canonicalUrl)
	.sort();

function parseLocations(xml: string): string[] {
	return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((match) => match[1]);
}

async function fetchSitemap(): Promise<string> {
	const response = await GET({} as Parameters<typeof GET>[0]);
	return response.text();
}

describe('sitemap.xml', () => {
	it('serves XML so crawlers parse it instead of guessing', async () => {
		const response = await GET({} as Parameters<typeof GET>[0]);
		const body = await response.text();

		expect(response.headers.get('content-type')).toBe('application/xml');
		expect(body.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
		expect(body).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
		expect(body.trimEnd().endsWith('</urlset>')).toBe(true);
	});

	it('lists exactly the URLs that a page file exists for', async () => {
		const locations = parseLocations(await fetchSitemap()).sort();
		const expected = EXPECTED_LOCATIONS;
		expect(expected.length).toBeGreaterThan(0);
		expect(locations).toEqual(expected);
	});
});
