import { BIO_NAME } from './bio';

/** Origin the site is publicly served from. `CNAME` maps t-industri.es here. */
export const SITE_ORIGIN = 'https://t-industri.es';

export interface PageMetadata {
	title: string;
	description: string;
	/** Route path relative to SITE_ORIGIN. '/' is the home page. */
	path: string;
}

export type PageKey = 'home' | 'experience' | 'projects' | 'ethos';

export const PAGES: Record<PageKey, PageMetadata> = {
	home: {
		title: `${BIO_NAME} | Software Engineer`,
		description: `${BIO_NAME} is a software engineer and CS + AI student at the University of Bath. Experience at Amazon (Veeqo), MSD, and the CRIISP research group.`,
		path: '/'
	},
	experience: {
		title: `Experience | ${BIO_NAME}`,
		description: `Roles and results from ${BIO_NAME}'s career: Amazon (Veeqo), the University of Bath CRIISP group, MSD, and two education nonprofits.`,
		path: '/experience'
	},
	projects: {
		title: `Projects | ${BIO_NAME}`,
		description: `Pinned open-source projects by ${BIO_NAME}, pulled from GitHub, with each repository's primary language and source link.`,
		path: '/projects'
	},
	ethos: {
		title: `Ethos | ${BIO_NAME}`,
		description: `The three principles ${BIO_NAME} works by, with the evidence behind each one: global perspective, continuous learning, and impactful purpose.`,
		path: '/ethos'
	}
};

export function canonicalUrl(path: string): string {
	return `${SITE_ORIGIN}${path}`;
}
