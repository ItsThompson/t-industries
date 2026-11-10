import { describe, it, expect } from 'vitest';
import { appearanceFor } from './inline-action-appearance';
import type { PageTone } from '$lib/paper';

const ACCENT = '#FF6363';

const TONES: PageTone[] = ['terminal', 'paper'];

function terminal(isActivatable = true) {
  return appearanceFor('terminal', { accent: ACCENT, isActivatable });
}

function paper(isActivatable = true) {
  return appearanceFor('paper', { accent: ACCENT, isActivatable });
}

describe('appearanceFor', () => {
  it('returns every style for each tone, so the component never branches itself', () => {
    for (const tone of TONES) {
      const appearance = appearanceFor(tone, { accent: ACCENT, isActivatable: true });

      expect(appearance.triggerClasses.length).toBeGreaterThan(0);
      expect(appearance.triggerStyle.length).toBeGreaterThan(0);
      expect(appearance.tooltipClasses.length).toBeGreaterThan(0);
      expect(appearance.labelClasses.length).toBeGreaterThan(0);
      expect(appearance.noteClasses.length).toBeGreaterThan(0);
      expect(appearance.hintClasses.length).toBeGreaterThan(0);
    }
  });

  it('leaves the tooltip open state to the caller', () => {
    for (const tone of TONES) {
      const appearance = appearanceFor(tone, { accent: ACCENT, isActivatable: true });

      expect(appearance.tooltipClasses).not.toContain('visible');
      expect(appearance.tooltipClasses).not.toContain('invisible');
    }
  });

  describe('terminal tone', () => {
    it('underlines the trigger in the accent instead of painting a band', () => {
      const appearance = terminal();

      expect(appearance.triggerClasses).toContain('border-dotted');
      expect(appearance.triggerClasses).not.toContain('rgba(var(--band)');
      expect(appearance.triggerStyle).toBe(
        `color:${ACCENT};border-color:${ACCENT};outline-color:${ACCENT}`
      );
    });

    it('offers no help cursor, because the action always does something', () => {
      expect(terminal(false).triggerClasses).not.toContain('cursor-help');
    });

    it('draws the note on a black card edged in the accent', () => {
      const appearance = terminal();

      expect(appearance.tooltipClasses).toContain('bg-black');
      expect(appearance.tooltipClasses).not.toContain('bg-paper-raised');
      expect(appearance.tooltipStyle).toBe(`border-color:${ACCENT}`);
      expect(appearance.labelStyle).toBe(`color:${ACCENT}`);
    });

    it('sets the label, note, and hint in the terminal type scale', () => {
      const appearance = terminal();

      expect(appearance.labelClasses).toContain('label-xs');
      expect(appearance.noteClasses).toContain('font-mono');
      expect(appearance.hintClasses).toContain('text-secondary-200');
    });
  });

  describe('paper tone', () => {
    it('clones a band behind the words across wrapped lines', () => {
      const appearance = paper();

      expect(appearance.triggerClasses).toContain('rgba(var(--band)');
      expect(appearance.triggerClasses).toContain('[box-decoration-break:clone]');
      expect(appearance.triggerClasses).not.toContain('border-dotted');
    });

    it('takes the band color from the accent, without painting the glyphs', () => {
      const appearance = paper();

      expect(appearance.triggerStyle).toContain('--band:');
      expect(appearance.triggerStyle).not.toContain('color:');
      expect(appearance.labelStyle).toBeUndefined();
    });

    it('outlines focus in ink, because a light accent is invisible on paper', () => {
      expect(paper().triggerClasses).toContain('focus-visible:outline-paper-ink');
    });

    it('gives a hover-only action the help cursor', () => {
      expect(paper(false).triggerClasses).toContain('cursor-help');
      expect(paper(true).triggerClasses).not.toContain('cursor-help');
    });

    it('leaves no gap where the help cursor would go', () => {
      expect(paper(true).triggerClasses).toBe(paper(true).triggerClasses.trim());
      expect(paper(true).triggerClasses).not.toContain('  ');
    });

    it('draws the note on a raised paper card with no accent edge', () => {
      const appearance = paper();

      expect(appearance.tooltipClasses).toContain('bg-paper-raised');
      expect(appearance.tooltipClasses).not.toContain('bg-black');
      expect(appearance.tooltipStyle).toBeUndefined();
    });

    it('labels the note in ink, so the accent never carries text', () => {
      const appearance = paper();

      expect(appearance.labelClasses).toContain('text-paper-ink');
      expect(appearance.noteClasses).toContain('text-paper-ink');
      expect(appearance.hintClasses).toContain('text-paper-muted');
    });
  });
});
