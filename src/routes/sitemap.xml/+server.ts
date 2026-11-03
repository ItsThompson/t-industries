import type { RequestHandler } from './$types';
import { canonicalUrl, routePathFromFile } from '$lib/seo';

export const prerender = true;

const PAGE_FILES = import.meta.glob('/src/routes/**/+page.svelte');

export const GET: RequestHandler = () => {
	const urls = Object.keys(PAGE_FILES)
		.map(routePathFromFile)
		.sort()
		.map((path) => `  <url>\n    <loc>${canonicalUrl(path)}</loc>\n  </url>`)
		.join('\n');

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

	return new Response(body, {
		headers: { 'content-type': 'application/xml' }
	});
};
