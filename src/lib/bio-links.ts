import { ACCENTS } from './accents';
import { CITY_COUNT } from './cities';
import { highlightHref } from './deep-links';

/**
 * An inline action in the bio. `target` names the element the action reveals,
 * and doubles as the note id, so it must be unique per action.
 */
export interface BioActionSpec {
	target: string;
	/** Short label shown at the top of the hover note. */
	label: string;
	/** Context that does not fit in the bio sentence. */
	note: string;
	accent: string;
}

export interface BioLinkSpec extends BioActionSpec {
	href: string;
}

export const BIO_LINKS = {
	amazon: {
		target: 'amazon',
		label: 'Amazon (Veeqo) / Front-End',
		note: 'Sep 2025 to present. Delivered 5 React settings pages to 50,000+ sellers and cut frontend build times by 82%.',
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
		note: 'Aug 2024 to present. Cut SEM creation time by 30% for scientists modeling pain perception.',
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
 * Opens the places map instead of a route, so it renders as a button.
 */
export const BIO_PLACES_ACTION: BioActionSpec = {
	target: 'places',
	label: `Places / ${CITY_COUNT} Cities`,
	note: `${CITY_COUNT} cities across Asia, Europe and North America. Open the map to see them all.`,
	accent: ACCENTS.ethos
};
