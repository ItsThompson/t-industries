import { describe, it, expect } from 'vitest';
import { canonicalUrl, routePathFromFile, SITE_ORIGIN } from './seo';

describe('canonicalUrl', () => {
	it('joins the origin and path with a single slash', () => {
		expect(canonicalUrl('/experience')).toBe('https://thompsontong.com/experience');
	});

	it('keeps the trailing slash for the home page', () => {
		expect(canonicalUrl('/')).toBe('https://thompsontong.com/');
	});

	it('serves from the domain declared in CNAME', () => {
		expect(SITE_ORIGIN).toBe('https://thompsontong.com');
	});
});

describe('routePathFromFile', () => {
	it('maps the root page file to the root URL', () => {
		expect(routePathFromFile('/src/routes/+page.svelte')).toBe('/');
	});

	it('maps a nested page file to its route', () => {
		expect(routePathFromFile('/src/routes/experience/+page.svelte')).toBe('/experience');
	});

	it('maps a deeply nested page file to its route', () => {
		expect(routePathFromFile('/src/routes/blog/first-post/+page.svelte')).toBe(
			'/blog/first-post'
		);
	});
});
