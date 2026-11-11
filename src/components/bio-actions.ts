import {
  BIO_LINKS,
  BIO_OLD_SITE_ACTION,
  BIO_PLACES_ACTION,
} from "$lib/bio-links";
import type { NoteScreenshot } from "$lib/bio-links";
import { citiesNote } from "$lib/cities";
import { experienceAnchorId } from "$lib/experiences";
import type { PageTone } from "$lib/paper";
import { withSummaryOrigin } from "$lib/summary-origin";

export type BioWorkId = "amazon" | "msd" | "criisp";

export interface BioPhraseAction {
  target: string;
  label: string;
  accent: string;
  note?: string;
  screenshot?: NoteScreenshot;
  href?: string;
  /* A required `hint: string` distinguishes "hide the hint" (`''`) from "use the default `CLICK TO OPEN`" (omitted), which an optional field would merge into one. */
  hint: string;
  onActivate?: (event: MouseEvent, trigger: HTMLElement) => void;
}

export interface BioPhraseHandlers {
  openMap: (event: MouseEvent) => void;
  openOldSite: (event: MouseEvent) => void;
  jumpToWork?: (id: BioWorkId, trigger: HTMLElement, event: MouseEvent) => void;
}

export interface BioActions {
  years: BioPhraseAction;
  places: BioPhraseAction;
  continuousLearning: BioPhraseAction;
  work: (id: BioWorkId) => BioPhraseAction;
}

const OPEN_HINT = "CLICK TO OPEN";
const OPEN_MAP_HINT = "CLICK TO OPEN MAP";
const JUMP_HINT = "JUMP TO HIGHLIGHT";
const NO_HINT = "";

const oldSitePhrase = {
  target: BIO_OLD_SITE_ACTION.target,
  label: BIO_OLD_SITE_ACTION.label,
  accent: BIO_OLD_SITE_ACTION.accent,
  screenshot: BIO_OLD_SITE_ACTION.screenshot,
} satisfies Omit<BioPhraseAction, "hint">;

const ACTIONS_BY_TONE: Record<
  PageTone,
  (handlers: BioPhraseHandlers) => BioActions
> = {
  terminal: ({ openMap, openOldSite }) => ({
    years: { ...oldSitePhrase, hint: OPEN_HINT, onActivate: openOldSite },
    places: { ...BIO_PLACES_ACTION, hint: OPEN_MAP_HINT, onActivate: openMap },
    continuousLearning: { ...BIO_LINKS.continuousLearning, hint: OPEN_HINT },
    work: (id) => ({ ...BIO_LINKS[id], hint: OPEN_HINT }),
  }),

  paper: ({ jumpToWork }) => ({
    years: { ...oldSitePhrase, hint: NO_HINT },
    places: { ...BIO_PLACES_ACTION, note: citiesNote(), hint: NO_HINT },
    continuousLearning: {
      ...BIO_LINKS.continuousLearning,
      href: withSummaryOrigin(BIO_LINKS.continuousLearning.href),
      hint: OPEN_HINT,
    },
    work: (id) => ({
      ...BIO_LINKS[id],
      href: `#${experienceAnchorId(id)}`,
      hint: JUMP_HINT,
      onActivate: jumpToWork
        ? (event, trigger) => jumpToWork(id, trigger, event)
        : undefined,
    }),
  }),
};

export function bioActionsFor(
  tone: PageTone,
  handlers: BioPhraseHandlers,
): BioActions {
  return ACTIONS_BY_TONE[tone](handlers);
}
