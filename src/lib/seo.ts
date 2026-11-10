/** Origin the site is publicly served from. `CNAME` maps thompsontong.com here. */
export const SITE_ORIGIN = 'https://thompsontong.com';

export function canonicalUrl(path: string): string {
	return `${SITE_ORIGIN}${path}`;
}

const ROUTES_ROOT = '/src/routes';

/**
 * Removes layout group segments. A group such as `(site)` organizes files and
 * appears in route ids, but never in a URL.
 */
export function stripRouteGroups(path: string): string {
	const segments = path
		.split('/')
		.filter((segment) => segment !== '' && !/^\(.+\)$/.test(segment));

	return `/${segments.join('/')}`;
}

/**
 * Turns a route file path from `import.meta.glob` into the URL path it is
 * served at, so the sitemap can be built from the routes that exist rather
 * than a list someone has to remember to extend.
 */
export function routePathFromFile(filePath: string): string {
	return stripRouteGroups(
		filePath.replace(ROUTES_ROOT, '').replace(/\/?\+page\.svelte$/, '')
	);
}
