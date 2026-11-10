import { BIO_LINKS, BIO_OLD_SITE_ACTION, BIO_PLACES_ACTION } from '$lib/bio-links';
import type { NoteScreenshot } from '$lib/bio-links';
import { citiesNote } from '$lib/cities';
import { experienceAnchorId } from '$lib/experiences';
import type { PageTone } from '$lib/paper';
import { withSummaryOrigin } from '$lib/summary-origin';

/** The roles the bio names, each with its own entry on the experience page. */
export type BioWorkId = 'amazon' | 'msd' | 'criisp';

/**
 * Everything one phrase of the bio hands to its inline action, for one page
 * tone. The tone supplies the whole set, so the component never branches on it.
 */
export interface BioPhraseAction {
    target: string;
    label: string;
    accent: string;
    note?: string;
    screenshot?: NoteScreenshot;
    href?: string;
    /** Empty hides the hint row; the terminal form of each phrase states its affordance. */
    hint: string;
    onActivate?: (event: MouseEvent) => void;
}

/** What the terminal page needs from the component to open its modals in place. */
export interface BioPhraseHandlers {
    openMap: (event: MouseEvent) => void;
    openOldSite: (event: MouseEvent) => void;
}

export interface BioActions {
    years: BioPhraseAction;
    places: BioPhraseAction;
    continuousLearning: BioPhraseAction;
    work: (id: BioWorkId) => BioPhraseAction;
}

const OPEN_HINT = 'CLICK TO OPEN';
const OPEN_MAP_HINT = 'CLICK TO OPEN MAP';
const JUMP_HINT = 'JUMP TO HIGHLIGHT';
const NO_HINT = '';

/** Only the fields the years phrase shows; the spec's heading and url belong to the modal. */
const oldSitePhrase = {
    target: BIO_OLD_SITE_ACTION.target,
    label: BIO_OLD_SITE_ACTION.label,
    accent: BIO_OLD_SITE_ACTION.accent,
    screenshot: BIO_OLD_SITE_ACTION.screenshot,
} satisfies Omit<BioPhraseAction, 'hint'>;

const ACTIONS_BY_TONE: Record<PageTone, (handlers: BioPhraseHandlers) => BioActions> = {
    terminal: ({ openMap, openOldSite }) => ({
        years: { ...oldSitePhrase, hint: OPEN_HINT, onActivate: openOldSite },
        places: { ...BIO_PLACES_ACTION, hint: OPEN_MAP_HINT, onActivate: openMap },
        continuousLearning: { ...BIO_LINKS.continuousLearning, hint: OPEN_HINT },
        work: (id) => ({ ...BIO_LINKS[id], hint: OPEN_HINT }),
    }),

    // The summary is a single page with no modals, so each phrase either jumps
    // to a section further down or links back into the terminal.
    paper: () => ({
        years: { ...oldSitePhrase, hint: NO_HINT },
        // The map is a terminal-only view, so the note has to name every city.
        places: { ...BIO_PLACES_ACTION, note: citiesNote(), hint: NO_HINT },
        // Marked as leaving the summary, so the terminal can offer the way back.
        continuousLearning: {
            ...BIO_LINKS.continuousLearning,
            href: withSummaryOrigin(BIO_LINKS.continuousLearning.href),
            hint: OPEN_HINT,
        },
        work: (id) => ({
            ...BIO_LINKS[id],
            href: `#${experienceAnchorId(id)}`,
            hint: JUMP_HINT,
        }),
    }),
};

export function bioActionsFor(tone: PageTone, handlers: BioPhraseHandlers): BioActions {
    return ACTIONS_BY_TONE[tone](handlers);
}
