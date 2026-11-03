import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import Seo from './Seo.svelte';
import { resetPageRoute, setPageRoute } from '$lib/__mocks__/app-stores';
import { BIO_NAME } from '$lib/bio';
import { canonicalUrl } from '$lib/seo';

const TITLE = 'Experience | Thompson Tong';
const DESCRIPTION = 'Roles and results from Thompson Tong.';

function headContent(selector: string): string | null {
	return document.head.querySelector(selector)?.getAttribute('content') ?? null;
}

function headHref(selector: string): string | null {
	return document.head.querySelector(selector)?.getAttribute('href') ?? null;
}

function renderSeo(props: { profilePage?: boolean } = {}): ReturnType<typeof render> {
	return render(Seo, { props: { title: TITLE, description: DESCRIPTION, ...props } });
}

describe('Seo', () => {
	afterEach(() => {
		cleanup();
		resetPageRoute();
	});

	it('sets the page title and description from its props', () => {
		setPageRoute('/experience');
		renderSeo();

		expect(document.title).toBe(TITLE);
		expect(headContent('meta[name="description"]')).toBe(DESCRIPTION);
	});

	it('derives the canonical URL from the route the page is rendering at', () => {
		setPageRoute('/experience');
		renderSeo();

		expect(headHref('link[rel="canonical"]')).toBe(canonicalUrl('/experience'));
	});

	it('canonicalises the home page to the bare origin', () => {
		setPageRoute('/');
		renderSeo();

		expect(headHref('link[rel="canonical"]')).toBe(canonicalUrl('/'));
	});

	it('refuses to emit a canonical URL when the route is unknown, instead of guessing one', () => {
		setPageRoute(null);

		expect(() => renderSeo()).toThrow(/route id/);
	});

	it('mirrors the metadata into Open Graph and Twitter tags for shared links', () => {
		setPageRoute('/ethos');
		renderSeo();

		expect(headContent('meta[property="og:title"]')).toBe(TITLE);
		expect(headContent('meta[property="og:description"]')).toBe(DESCRIPTION);
		expect(headContent('meta[property="og:url"]')).toBe(canonicalUrl('/ethos'));
		expect(headContent('meta[property="og:site_name"]')).toBe(BIO_NAME);
		expect(headContent('meta[name="twitter:card"]')).toBe('summary');
	});

	it('marks a non-profile page as a website', () => {
		setPageRoute('/ethos');
		renderSeo();

		expect(headContent('meta[property="og:type"]')).toBe('website');
	});

	it('omits structured data by default so only the profile page claims to describe the person', () => {
		setPageRoute('/ethos');
		renderSeo();

		expect(document.head.querySelector('script[type="application/ld+json"]')).toBeNull();
	});

	it('embeds a parseable profile graph on the profile page', () => {
		setPageRoute('/');
		renderSeo({ profilePage: true });

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
		setPageRoute('/experience');
		const first = renderSeo();
		first.unmount();

		setPageRoute('/ethos');
		renderSeo();

		expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
		expect(headHref('link[rel="canonical"]')).toBe(canonicalUrl('/ethos'));
	});
});
