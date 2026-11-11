import { BIO_LINKS, BIO_OLD_SITE_ACTION, BIO_PLACES_ACTION } from '$lib/bio-links';
import type { BioLinkSpec } from '$lib/bio-links';
import { citiesNote } from '$lib/cities';
import { experienceAnchorId } from '$lib/experiences';
import type { PageMode } from '$lib/paper';
import { withSummaryOrigin } from '$lib/summary-origin';
import type { NoteCard, PhraseAction } from './inline-phrase';

export type BioWorkId = 'amazon' | 'msd' | 'criisp';

export interface BioPhraseHandlers {
    openMap: (event: MouseEvent) => void;
    openOldSite: (event: MouseEvent) => void;
    jumpToWork?: (id: BioWorkId, trigger: HTMLElement, event: MouseEvent) => void;
}

export interface BioActions {
    years: PhraseAction;
    places: PhraseAction;
    continuousLearning: PhraseAction;
    work: (id: BioWorkId) => PhraseAction;
}

const OPEN_HINT = 'CLICK TO OPEN';
const OPEN_MAP_HINT = 'CLICK TO OPEN MAP';

function linkCard(spec: BioLinkSpec): NoteCard {
    return { label: spec.label, note: spec.note, hint: OPEN_HINT };
}

const ACTIONS_BY_MODE: Record<PageMode, (handlers: BioPhraseHandlers) => BioActions> = {
    terminal: ({ openMap, openOldSite }) => ({
        years: {
            kind: 'activate',
            target: BIO_OLD_SITE_ACTION.target,
            accent: BIO_OLD_SITE_ACTION.accent,
            card: {
                label: BIO_OLD_SITE_ACTION.label,
                hint: OPEN_HINT,
                media: BIO_OLD_SITE_ACTION.screenshot,
            },
            onActivate: openOldSite,
        },
        places: {
            kind: 'activate',
            target: BIO_PLACES_ACTION.target,
            accent: BIO_PLACES_ACTION.accent,
            card: {
                label: BIO_PLACES_ACTION.label,
                note: BIO_PLACES_ACTION.note,
                hint: OPEN_MAP_HINT,
            },
            onActivate: openMap,
        },
        continuousLearning: {
            kind: 'navigate',
            target: BIO_LINKS.continuousLearning.target,
            accent: BIO_LINKS.continuousLearning.accent,
            href: BIO_LINKS.continuousLearning.href,
            card: linkCard(BIO_LINKS.continuousLearning),
        },
        work: (id) => ({
            kind: 'navigate',
            target: BIO_LINKS[id].target,
            accent: BIO_LINKS[id].accent,
            href: BIO_LINKS[id].href,
            card: linkCard(BIO_LINKS[id]),
        }),
    }),

    paper: ({ jumpToWork }) => ({
        years: {
            kind: 'describe',
            target: BIO_OLD_SITE_ACTION.target,
            accent: BIO_OLD_SITE_ACTION.accent,
            card: { label: BIO_OLD_SITE_ACTION.label, media: BIO_OLD_SITE_ACTION.screenshot },
        },
        places: {
            kind: 'describe',
            target: BIO_PLACES_ACTION.target,
            accent: BIO_PLACES_ACTION.accent,
            card: { label: BIO_PLACES_ACTION.label, note: citiesNote() },
        },
        continuousLearning: {
            kind: 'navigate',
            target: BIO_LINKS.continuousLearning.target,
            accent: BIO_LINKS.continuousLearning.accent,
            href: withSummaryOrigin(BIO_LINKS.continuousLearning.href),
            card: linkCard(BIO_LINKS.continuousLearning),
        },
        // Each role already sits further down this page with its dates and
        // highlight, so the phrase is a plain link and carries no card.
        work: (id) => ({
            kind: 'navigate',
            target: BIO_LINKS[id].target,
            accent: BIO_LINKS[id].accent,
            href: `#${experienceAnchorId(id)}`,
            onActivate: jumpToWork
                ? (event, trigger) => jumpToWork(id, trigger, event)
                : undefined,
        }),
    }),
};

export function bioActionsFor(mode: PageMode, handlers: BioPhraseHandlers): BioActions {
    return ACTIONS_BY_MODE[mode](handlers);
}
