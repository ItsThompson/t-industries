import { describe, it, expect } from 'vitest';
import { canonicalUrl, routePathFromFile, stripRouteGroups, SITE_ORIGIN } from './seo';

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

describe('stripRouteGroups', () => {
	it('drops a layout group from a route id', () => {
		expect(stripRouteGroups('/(terminal)/terminal/ethos')).toBe('/terminal/ethos');
	});

	it('leaves a route outside any group alone', () => {
		expect(stripRouteGroups('/terminal/projects')).toBe('/terminal/projects');
	});

	it('keeps the root route as the root', () => {
		expect(stripRouteGroups('/')).toBe('/');
	});

	it('keeps the root route when it is itself inside the group', () => {
		expect(stripRouteGroups('/(canvas)')).toBe('/');
	});

	it('drops every group segment when groups nest', () => {
		expect(stripRouteGroups('/(a)/(b)/x')).toBe('/x');
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

	it('maps a page file inside a layout group to the same URL as one outside it', () => {
		expect(routePathFromFile('/src/routes/(terminal)/terminal/experience/+page.svelte')).toBe(
			routePathFromFile('/src/routes/terminal/experience/+page.svelte')
		);
	});

	it('maps a root page file inside a layout group to the root URL', () => {
		expect(routePathFromFile('/src/routes/(canvas)/+page.svelte')).toBe('/');
	});
});
