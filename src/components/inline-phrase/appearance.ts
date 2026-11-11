import { CANVAS_BAND_CLASSES, canvasBandStyle, type PageMode } from '$lib/canvas';
import type { PhraseKind } from './types';

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

const TRIGGER_BY_MODE: Record<PageMode, (input: TriggerInput) => TriggerAppearance> = {
    terminal: ({ accent }) => ({
        classes: `border-b border-dotted hover:border-solid transition-colors duration-150 ${FOCUS_CLASSES}`,
        style: `color:${accent};border-color:${accent};outline-color:${accent}`,
    }),

    canvas: ({ accent, kind }) => ({
        classes: classes(CANVAS_BAND_CLASSES, kind === 'describe' ? 'cursor-help' : ''),
        style: canvasBandStyle(accent),
    }),
};

const CARD_BY_MODE: Record<PageMode, (input: CardInput) => CardAppearance> = {
    terminal: ({ accent }) => ({
        classes: `${CARD_FRAME} bg-black border p-2`,
        style: `border-color:${accent}`,
        labelClasses: 'label-xs block mb-1',
        labelStyle: `color:${accent}`,
        noteClasses: 'block text-xs font-mono text-secondary-100 leading-relaxed',
        hintClasses: 'label-xs block mt-1 text-secondary-200',
    }),

    canvas: () => ({
        classes: `${CARD_FRAME} bg-canvas-raised border border-canvas-ink/15 rounded-[5px] p-3 font-outfit shadow-[0_10px_28px_rgba(28,25,23,0.13)]`,
        style: undefined,
        labelClasses:
            'block mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-canvas-ink',
        labelStyle: undefined,
        noteClasses: 'block text-[13px] font-light leading-normal text-canvas-ink',
        hintClasses: 'block mt-1.5 text-[9px] uppercase tracking-[0.1em] text-canvas-muted',
    }),
};

export function triggerAppearanceFor(mode: PageMode, input: TriggerInput): TriggerAppearance {
    return TRIGGER_BY_MODE[mode](input);
}

export function cardAppearanceFor(mode: PageMode, input: CardInput): CardAppearance {
    return CARD_BY_MODE[mode](input);
}
