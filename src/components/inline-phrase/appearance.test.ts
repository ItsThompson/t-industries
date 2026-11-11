import { describe, it, expect } from 'vitest';
import { cardAppearanceFor, triggerAppearanceFor } from './appearance';
import type { PageMode } from '$lib/paper';
import type { PhraseKind } from './types';

const ACCENT = '#FF6363';

const MODES: PageMode[] = ['terminal', 'paper'];
const KINDS: PhraseKind[] = ['navigate', 'activate', 'describe'];

function terminal(kind: PhraseKind = 'navigate') {
    return triggerAppearanceFor('terminal', { accent: ACCENT, kind });
}

function paper(kind: PhraseKind = 'navigate') {
    return triggerAppearanceFor('paper', { accent: ACCENT, kind });
}

describe('triggerAppearanceFor', () => {
    it('returns every style for each mode, so the component never branches itself', () => {
        for (const mode of MODES) {
            for (const kind of KINDS) {
                const appearance = triggerAppearanceFor(mode, { accent: ACCENT, kind });

                expect(appearance.classes.length).toBeGreaterThan(0);
                expect(appearance.style.length).toBeGreaterThan(0);
            }
        }
    });

    it('underlines the terminal trigger in the accent instead of painting a band', () => {
        const appearance = terminal();

        expect(appearance.classes).toContain('border-dotted');
        expect(appearance.classes).not.toContain('rgba(var(--band)');
        expect(appearance.style).toBe(
            `color:${ACCENT};border-color:${ACCENT};outline-color:${ACCENT}`
        );
    });

    it('offers no help cursor in the terminal mode, because every phrase does something', () => {
        for (const kind of KINDS) {
            expect(terminal(kind).classes).not.toContain('cursor-help');
        }
    });

    it('clones a band behind the paper words across wrapped lines', () => {
        const appearance = paper();

        expect(appearance.classes).toContain('rgba(var(--band)');
        expect(appearance.classes).toContain('[box-decoration-break:clone]');
        expect(appearance.classes).not.toContain('border-dotted');
    });

    it('takes the paper band color from the accent, without painting the glyphs', () => {
        const appearance = paper();

        expect(appearance.style).toContain('--band:');
        expect(appearance.style).not.toContain('color:');
    });

    it('outlines paper focus in ink, because a light accent is invisible on paper', () => {
        expect(paper().classes).toContain('focus-visible:outline-paper-ink');
    });

    it('gives only the reveal-only phrase the help cursor', () => {
        expect(paper('describe').classes).toContain('cursor-help');
        expect(paper('navigate').classes).not.toContain('cursor-help');
        expect(paper('activate').classes).not.toContain('cursor-help');
    });

    it('leaves no gap where the help cursor would go', () => {
        for (const kind of KINDS) {
            expect(paper(kind).classes).toBe(paper(kind).classes.trim());
            expect(paper(kind).classes).not.toContain('  ');
        }
    });
});

describe('cardAppearanceFor', () => {
    function terminalCard() {
        return cardAppearanceFor('terminal', { accent: ACCENT });
    }

    function paperCard() {
        return cardAppearanceFor('paper', { accent: ACCENT });
    }

    it('returns every style for each mode', () => {
        for (const mode of MODES) {
            const appearance = cardAppearanceFor(mode, { accent: ACCENT });

            expect(appearance.classes.length).toBeGreaterThan(0);
            expect(appearance.labelClasses.length).toBeGreaterThan(0);
            expect(appearance.noteClasses.length).toBeGreaterThan(0);
            expect(appearance.hintClasses.length).toBeGreaterThan(0);
        }
    });

    it('leaves the open state to the caller', () => {
        for (const mode of MODES) {
            const appearance = cardAppearanceFor(mode, { accent: ACCENT });

            expect(appearance.classes).not.toContain('visible');
        }
    });

    it('draws the terminal card on black, edged in the accent', () => {
        const appearance = terminalCard();

        expect(appearance.classes).toContain('bg-black');
        expect(appearance.classes).not.toContain('bg-paper-raised');
        expect(appearance.style).toBe(`border-color:${ACCENT}`);
        expect(appearance.labelStyle).toBe(`color:${ACCENT}`);
    });

    it('sets the terminal label, note, and hint in the terminal type scale', () => {
        const appearance = terminalCard();

        expect(appearance.labelClasses).toContain('label-xs');
        expect(appearance.noteClasses).toContain('font-mono');
        expect(appearance.hintClasses).toContain('text-secondary-200');
    });

    it('draws the paper card raised, with no accent edge', () => {
        const appearance = paperCard();

        expect(appearance.classes).toContain('bg-paper-raised');
        expect(appearance.classes).not.toContain('bg-black');
        expect(appearance.style).toBeUndefined();
    });

    it('labels the paper card in ink, so the accent never carries text', () => {
        const appearance = paperCard();

        expect(appearance.labelClasses).toContain('text-paper-ink');
        expect(appearance.noteClasses).toContain('text-paper-ink');
        expect(appearance.hintClasses).toContain('text-paper-muted');
        expect(appearance.labelStyle).toBeUndefined();
    });
});
