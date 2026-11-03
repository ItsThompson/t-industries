import { BIO_NAME, SOCIAL_LINKS } from './bio';
import { canonicalUrl, PAGES, SITE_ORIGIN } from './seo';

export interface JsonLdNode {
	'@type': string;
	'@id'?: string;
	[key: string]: unknown;
}

export interface JsonLdGraph {
	'@context': 'https://schema.org';
	'@graph': JsonLdNode[];
}

const PERSON_ID = `${SITE_ORIGIN}/#person`;
const WEBSITE_ID = `${SITE_ORIGIN}/#website`;
const PROFILE_PAGE_ID = `${SITE_ORIGIN}/#profilepage`;

const ALMA_MATER: JsonLdNode = {
	'@type': 'CollegeOrUniversity',
	name: 'University of Bath',
	url: 'https://www.bath.ac.uk'
};

const EMPLOYERS: JsonLdNode[] = [
	{ '@type': 'Organization', name: 'Amazon', url: 'https://www.amazon.com' },
	{ '@type': 'Organization', name: 'MSD', url: 'https://www.msd.com' }
];

export function buildProfileGraph(): JsonLdGraph {
	return {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'WebSite',
				'@id': WEBSITE_ID,
				url: canonicalUrl('/'),
				name: BIO_NAME,
				inLanguage: 'en',
				publisher: { '@id': PERSON_ID }
			},
			{
				'@type': 'ProfilePage',
				'@id': PROFILE_PAGE_ID,
				url: canonicalUrl('/'),
				name: PAGES.home.title,
				isPartOf: { '@id': WEBSITE_ID },
				mainEntity: { '@id': PERSON_ID }
			},
			{
				'@type': 'Person',
				'@id': PERSON_ID,
				name: BIO_NAME,
				alternateName: 'ItsThompson',
				jobTitle: 'Software Engineer',
				description: PAGES.home.description,
				url: canonicalUrl('/'),
				sameAs: SOCIAL_LINKS.map((link) => link.href),
				alumniOf: ALMA_MATER,
				worksFor: EMPLOYERS
			}
		]
	};
}

/** Escapes `<` so a stray `</script>` cannot close the surrounding script element. */
export function serializeJsonLd(graph: JsonLdGraph): string {
	return JSON.stringify(graph).replace(/</g, '\\u003c');
}
