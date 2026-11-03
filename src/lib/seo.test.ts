import { describe, it, expect } from 'vitest';
import { BIO_NAME } from './bio';
import { canonicalUrl, PAGES, SITE_ORIGIN, type PageMetadata } from './seo';

const pages: PageMetadata[] = Object.values(PAGES);

describe('PAGES', () => {
	it('gives every page a title, a description, and an absolute-rooted path', () => {
		for (const page of pages) {
			expect(page.title.trim().length).toBeGreaterThan(0);
			expect(page.description.trim().length).toBeGreaterThan(0);
			expect(page.path.startsWith('/')).toBe(true);
		}
	});

	it('keeps descriptions short enough that search results show them in full', () => {
		for (const page of pages) {
			expect(page.description.length).toBeGreaterThanOrEqual(70);
			expect(page.description.length).toBeLessThanOrEqual(160);
		}
	});

	it('names the person in the home title and description so a name query matches', () => {
		expect(PAGES.home.title.startsWith(BIO_NAME)).toBe(true);
		expect(PAGES.home.description).toContain(BIO_NAME);
	});

	it('names the person in every inner page title', () => {
		const innerPages = pages.filter((page) => page !== PAGES.home);

		for (const page of innerPages) {
			expect(page.title).toContain(BIO_NAME);
		}
	});

	it('uses distinct titles and descriptions so pages do not compete for one query', () => {
		expect(new Set(pages.map((page) => page.title)).size).toBe(pages.length);
		expect(new Set(pages.map((page) => page.description)).size).toBe(pages.length);
		expect(new Set(pages.map((page) => page.path)).size).toBe(pages.length);
	});
});

describe('canonicalUrl', () => {
	it('joins the origin and path with a single slash', () => {
		expect(canonicalUrl('/experience')).toBe('https://t-industri.es/experience');
	});

	it('keeps the trailing slash for the home page', () => {
		expect(canonicalUrl('/')).toBe('https://t-industri.es/');
	});

	it('serves from the domain declared in CNAME', () => {
		expect(SITE_ORIGIN).toBe('https://t-industri.es');
	});
});
