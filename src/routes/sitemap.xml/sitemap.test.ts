import { describe, it, expect } from 'vitest';
import { GET } from './+server';
import { PAGES } from '$lib/seo';

function parseLocations(xml: string): string[] {
	return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((match) => match[1]);
}

describe('sitemap.xml', () => {
	it('lists every page the site publishes', async () => {
		const response = await GET({} as Parameters<typeof GET>[0]);
		const locations = parseLocations(await response.text());

		expect(locations.sort()).toEqual(
			Object.values(PAGES)
				.map((page) => `https://t-industri.es${page.path}`)
				.sort()
		);
	});

	it('serves XML so crawlers parse it instead of guessing', async () => {
		const response = await GET({} as Parameters<typeof GET>[0]);
		const body = await response.text();

		expect(response.headers.get('content-type')).toBe('application/xml');
		expect(body.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
		expect(body).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
		expect(body.trimEnd().endsWith('</urlset>')).toBe(true);
	});
});
