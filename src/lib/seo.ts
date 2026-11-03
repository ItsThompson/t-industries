/** Origin the site is publicly served from. `CNAME` maps t-industri.es here. */
export const SITE_ORIGIN = 'https://t-industri.es';

export function canonicalUrl(path: string): string {
	return `${SITE_ORIGIN}${path}`;
}

const ROUTES_ROOT = '/src/routes';

/**
 * Turns a route file path from `import.meta.glob` into the URL path it is
 * served at, so the sitemap can be built from the routes that exist rather
 * than a list someone has to remember to extend.
 */
export function routePathFromFile(filePath: string): string {
	const route = filePath.replace(ROUTES_ROOT, '').replace(/\/?\+page\.svelte$/, '');
	return route === '' ? '/' : route;
}
