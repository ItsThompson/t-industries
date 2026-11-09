import { base } from '$app/paths';
import { ACCENTS } from './accents';
import { CITY_COUNT } from './cities';
import { highlightHref } from './deep-links';

/** An image shown inside a hover note, for actions whose point is the picture. */
export interface NoteScreenshot {
	/** Path under `static/`, prefixed with the deploy base. */
	src: string;
	alt: string;
	/** Intrinsic pixel size, so the note reserves the image box before it loads. */
	width: number;
	height: number;
}

/**
 * An inline action in the bio. `target` names the element the action reveals,
 * and doubles as the note id, so it must be unique per action.
 */
export interface BioActionSpec {
	target: string;
	/** Short label shown at the top of the hover note. */
	label: string;
	/**
	 * Context that does not fit in the bio sentence. Omit it when the screenshot
	 * says enough on its own.
	 */
	note?: string;
	accent: string;
	screenshot?: NoteScreenshot;
}

export interface BioLinkSpec extends BioActionSpec {
	href: string;
}

/** An action whose note carries a picture the reader can open full size. */
export interface OldSiteSpec extends BioActionSpec {
	screenshot: NoteScreenshot;
	/** Live copy, which the modal frames. */
	url: string;
	/** Heading of the modal, above the frame. */
	heading: string;
}

export const BIO_LINKS = {
	amazon: {
		target: 'amazon',
		label: 'Amazon (Veeqo) / Front-End',
		note: 'Sep 2025 to Sep 2026. Cut frontend build times by 82% by designing the monolith-to-microservices migration on a website with 50,000+ sellers.',
		href: highlightHref('/experience', 'amazon'),
		accent: ACCENTS.amazon
	},
	msd: {
		target: 'msd',
		label: 'MSD / MLOps',
		note: 'Jun to Jul 2024. Deployed a RAG pipeline that cut document processing time by 48%.',
		href: highlightHref('/experience', 'msd'),
		accent: ACCENTS.msd
	},
	criisp: {
		target: 'criisp',
		label: 'University of Bath / CRIISP',
		note: 'Aug 2024 to Sep 2025. Cut SEM creation time by 30% for scientists modeling pain perception.',
		href: highlightHref('/experience', 'criisp'),
		accent: ACCENTS.criisp
	},
	continuousLearning: {
		target: 'continuous-learning',
		label: 'Ethos / Continuous Learning',
		note: 'Standing on the shoulders of giants: read the principle and the evidence behind it.',
		href: highlightHref('/ethos', 'continuous-learning'),
		accent: ACCENTS.ethos
	}
} satisfies Record<string, BioLinkSpec>;

/**
 * The first website: a screenshot as the note, and the live copy in the modal.
 */
export const BIO_OLD_SITE_ACTION = {
	target: 'old-site',
	label: 'Old Site / First Build',
	accent: ACCENTS.prose,
	url: 'https://itsthompson.github.io/personal-website/',
	heading: 'THE FIRST WEBSITE',
	screenshot: {
		src: `${base}/old-site.png`,
		alt: 'Home page of the first site: a sunset gradient fills the screen, a four item nav bar sits above the name Thompson T. in large serif capitals.',
		width: 2048,
		height: 1610
	}
} satisfies OldSiteSpec;

/**
 * Opens the places map instead of a route, so it renders as a button.
 */
export const BIO_PLACES_ACTION: BioActionSpec = {
	target: 'places',
	label: `Places / ${CITY_COUNT} Cities`,
	note: `${CITY_COUNT} cities across Asia, Europe and North America. Open the map to see them all.`,
	accent: ACCENTS.ethos
};
