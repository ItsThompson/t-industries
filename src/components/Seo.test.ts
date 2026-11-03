import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import Seo from './Seo.svelte';
import { canonicalUrl, PAGES } from '$lib/seo';
import { BIO_NAME } from '$lib/bio';

function headContent(selector: string): string | null {
	return document.head.querySelector(selector)?.getAttribute('content') ?? null;
}

function headHref(selector: string): string | null {
	return document.head.querySelector(selector)?.getAttribute('href') ?? null;
}

describe('Seo', () => {
	afterEach(() => {
		cleanup();
	});

	it('sets the page title and description from the page metadata', () => {
		render(Seo, { props: { page: PAGES.experience } });

		expect(document.title).toBe(PAGES.experience.title);
		expect(headContent('meta[name="description"]')).toBe(PAGES.experience.description);
	});

	it('points the canonical link at the public URL for the page', () => {
		render(Seo, { props: { page: PAGES.projects } });

		expect(headHref('link[rel="canonical"]')).toBe(canonicalUrl('/projects'));
	});

	it('mirrors the metadata into Open Graph and Twitter tags for shared links', () => {
		render(Seo, { props: { page: PAGES.ethos } });

		expect(headContent('meta[property="og:title"]')).toBe(PAGES.ethos.title);
		expect(headContent('meta[property="og:description"]')).toBe(PAGES.ethos.description);
		expect(headContent('meta[property="og:url"]')).toBe(canonicalUrl('/ethos'));
		expect(headContent('meta[property="og:site_name"]')).toBe(BIO_NAME);
		expect(headContent('meta[name="twitter:card"]')).toBe('summary');
	});

	it('marks a non-profile page as a website', () => {
		render(Seo, { props: { page: PAGES.ethos } });

		expect(headContent('meta[property="og:type"]')).toBe('website');
	});

	it('omits structured data by default so only the profile page claims to describe the person', () => {
		render(Seo, { props: { page: PAGES.ethos } });

		expect(document.head.querySelector('script[type="application/ld+json"]')).toBeNull();
	});

	it('embeds a parseable profile graph on the profile page', () => {
		render(Seo, { props: { page: PAGES.home, profilePage: true } });

		const script = document.head.querySelector('script[type="application/ld+json"]');
		expect(script).not.toBeNull();

		const graph = JSON.parse(script?.textContent ?? '');
		expect(graph['@context']).toBe('https://schema.org');
		expect(headContent('meta[property="og:type"]')).toBe('profile');

		const person = graph['@graph'].find(
			(node: { '@type': string }) => node['@type'] === 'Person'
		);
		expect(person.name).toBe(BIO_NAME);
	});

	it('replaces the previous page tags instead of stacking them on navigation', () => {
		const first = render(Seo, { props: { page: PAGES.projects } });
		first.unmount();
		render(Seo, { props: { page: PAGES.ethos } });

		expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
		expect(headHref('link[rel="canonical"]')).toBe(canonicalUrl('/ethos'));
	});
});
