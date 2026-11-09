import { describe, it, expect } from 'vitest';
import { BIO_NAME, SOCIAL_LINKS } from './bio';
import { canonicalUrl, SITE_ORIGIN } from './seo';
import { buildProfileGraph, serializeJsonLd, type JsonLdNode } from './structured-data';

function getNode(graphType: string): JsonLdNode {
	const node = buildProfileGraph()['@graph'].find((candidate) => candidate['@type'] === graphType);
	if (!node) {
		throw new Error(`graph has no ${graphType} node`);
	}
	return node;
}

function findById(id: string): JsonLdNode | undefined {
	return buildProfileGraph()['@graph'].find((candidate) => candidate['@id'] === id);
}

describe('buildProfileGraph', () => {
	it('describes the person with the same name, job title, and URL the page shows', () => {
		const person = getNode('Person');

		expect(person.name).toBe(BIO_NAME);
		expect(person.jobTitle).toBe('Software Engineer');
		expect(person.url).toBe(canonicalUrl('/'));
	});

	it('claims every profile the site links to, so search engines can merge the identities', () => {
		const person = getNode('Person');

		expect(person.sameAs).toEqual(SOCIAL_LINKS.map((link) => link.href));
	});

	it('gives every organization a URL to disambiguate it', () => {
		const person = getNode('Person');
		const alumniOf = person.alumniOf as JsonLdNode[];

		expect(alumniOf.map((org) => org.name)).toEqual(['University of Bath', 'Amazon', 'MSD']);
		for (const org of alumniOf) {
			expect(org.url).toBeTruthy();
		}
	});

	it('claims no current employer, since every listed role has ended', () => {
		const person = getNode('Person');

		expect(person.worksFor).toBeUndefined();
	});

	it('wires the profile page to the person and the person to the site', () => {
		const profilePage = getNode('ProfilePage');
		const person = getNode('Person');
		const website = getNode('WebSite');

		expect((profilePage.mainEntity as JsonLdNode)['@id']).toBe(person['@id']);
		expect((website.publisher as JsonLdNode)['@id']).toBe(person['@id']);
		expect((profilePage.isPartOf as JsonLdNode)['@id']).toBe(website['@id']);
	});

	it('resolves every internal reference, so no node dangles', () => {
		const internalIds = [
			...new Set(
				buildProfileGraph()['@graph']
					.flatMap((node) => collectIds(node))
					.filter((id) => id.startsWith(SITE_ORIGIN))
			)
		];

		expect(internalIds.length).toBeGreaterThan(0);
		for (const id of internalIds) {
			expect(findById(id)).toBeDefined();
		}
	});

	it('declares schema.org once and holds exactly one person', () => {
		const graph = buildProfileGraph();

		expect(graph['@context']).toBe('https://schema.org');
		expect(graph['@graph'].filter((node) => node['@type'] === 'Person')).toHaveLength(1);
	});
});

describe('serializeJsonLd', () => {
	it('round-trips to the same graph', () => {
		const graph = buildProfileGraph();

		expect(JSON.parse(serializeJsonLd(graph))).toEqual(graph);
	});

	it('escapes angle brackets so a value cannot close the surrounding script element', () => {
		const serialized = serializeJsonLd({
			'@context': 'https://schema.org',
			'@graph': [{ '@type': 'Person', name: '</script><script>alert(1)</script>' }]
		});

		expect(serialized).not.toContain('</script');
		expect(serialized).toContain('\\u003c/script');
	});
});

function collectIds(value: unknown): string[] {
	if (Array.isArray(value)) {
		return value.flatMap((item) => collectIds(item));
	}
	if (typeof value !== 'object' || value === null) {
		return [];
	}

	const record = value as Record<string, unknown>;
	const ownId = typeof record['@id'] === 'string' ? [record['@id']] : [];
	return [...ownId, ...Object.values(record).flatMap((child) => collectIds(child))];
}
