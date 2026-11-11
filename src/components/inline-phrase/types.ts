import type { NoteScreenshot } from '$lib/bio-links';

/**
 * Everything a phrase says about itself when the reader asks. The card exists
 * only when a phrase declares one, so "this phrase has no card" is a shape the
 * caller can write, not a flag the component has to interpret.
 */
export interface NoteCard {
    label: string;
    note?: string;
    /* Omitted leaves the line out entirely. There is no default to fall back on. */
    hint?: string;
    media?: NoteScreenshot;
}

export type Activate = (event: MouseEvent, trigger: HTMLElement) => void;

interface PhraseBase {
    /* Names the node that ties the trigger to its card. */
    target: string;
    accent: string;
}

/*
 * How the phrase behaves, declared once instead of inferred from which props
 * happen to be set:
 *
 *   navigate  follows a destination, and may also hand the click to a handler
 *   activate  acts in place, so it needs button semantics and keyboard support
 *   describe  reveals its card and does nothing else
 */
export type PhraseKind = 'navigate' | 'activate' | 'describe';

export type PhraseAction =
    | (PhraseBase & {
          kind: 'navigate';
          href: string;
          card?: NoteCard;
          onActivate?: Activate;
      })
    | (PhraseBase & { kind: 'activate'; onActivate: Activate; card?: NoteCard })
    | (PhraseBase & { kind: 'describe'; card: NoteCard });
