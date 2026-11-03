import type { RequestHandler } from './$types';
import { canonicalUrl, PAGES } from '$lib/seo';

export const prerender = true;

export const GET: RequestHandler = () => {
	const urls = Object.values(PAGES)
		.map((page) => `  <url>\n    <loc>${canonicalUrl(page.path)}</loc>\n  </url>`)
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
