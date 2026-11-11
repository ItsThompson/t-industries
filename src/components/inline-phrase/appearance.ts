import { PAPER_BAND_CLASSES, paperBandStyle, type PageTone } from '$lib/paper';
import type { PhraseKind } from './types';

/**
 * Every tone-dependent style, split by the element that renders it, so the
 * trigger and the card each receive only the classes they apply.
 */

export interface TriggerAppearance {
    classes: string;
    style: string;
}

export interface CardAppearance {
    classes: string;
    style: string | undefined;
    labelClasses: string;
    labelStyle: string | undefined;
    noteClasses: string;
    hintClasses: string;
}

export interface TriggerInput {
    accent: string;
    kind: PhraseKind;
}

export interface CardInput {
    accent: string;
}

const CARD_FRAME = 'fixed z-50 block w-64 max-w-[calc(100vw-1rem)] text-left pointer-events-none';

const FOCUS_CLASSES = 'focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2';

function classes(...values: string[]): string {
    return values.filter(Boolean).join(' ');
}

const TRIGGER_BY_TONE: Record<PageTone, (input: TriggerInput) => TriggerAppearance> = {
    terminal: ({ accent }) => ({
        classes: `border-b border-dotted hover:border-solid transition-colors duration-150 ${FOCUS_CLASSES}`,
        style: `color:${accent};border-color:${accent};outline-color:${accent}`,
    }),

    // The paper band carries the accent at low alpha behind ink glyphs. Text in
    // the raw accent is 1.3:1 to 3.3:1 on paper, so it never carries a glyph.
    paper: ({ accent, kind }) => ({
        classes: classes(PAPER_BAND_CLASSES, kind === 'describe' ? 'cursor-help' : ''),
        style: paperBandStyle(accent),
    }),
};

const CARD_BY_TONE: Record<PageTone, (input: CardInput) => CardAppearance> = {
    terminal: ({ accent }) => ({
        classes: `${CARD_FRAME} bg-black border p-2`,
        style: `border-color:${accent}`,
        labelClasses: 'label-xs block mb-1',
        labelStyle: `color:${accent}`,
        noteClasses: 'block text-xs font-mono text-secondary-100 leading-relaxed',
        hintClasses: 'label-xs block mt-1 text-secondary-200',
    }),

    paper: () => ({
        classes: `${CARD_FRAME} bg-paper-raised border border-paper-ink/15 rounded-[5px] p-3 font-outfit shadow-[0_10px_28px_rgba(28,25,23,0.13)]`,
        style: undefined,
        labelClasses:
            'block mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-paper-ink',
        labelStyle: undefined,
        noteClasses: 'block text-[13px] font-light leading-normal text-paper-ink',
        hintClasses: 'block mt-1.5 text-[9px] uppercase tracking-[0.1em] text-paper-muted',
    }),
};

export function triggerAppearanceFor(tone: PageTone, input: TriggerInput): TriggerAppearance {
    return TRIGGER_BY_TONE[tone](input);
}

export function cardAppearanceFor(tone: PageTone, input: CardInput): CardAppearance {
    return CARD_BY_TONE[tone](input);
}
