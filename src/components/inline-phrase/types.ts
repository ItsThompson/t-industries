import type { NoteScreenshot } from '$lib/bio-links';

export interface NoteCard {
    label: string;
    note?: string;
    hint?: string;
    media?: NoteScreenshot;
}

export type Activate = (event: MouseEvent, trigger: HTMLElement) => void;

interface PhraseBase {
    target: string;
    accent: string;
}

/* navigate follows a destination, activate acts in place, describe only reveals its card. */
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
