import { describe, it, expect, vi } from 'vitest';
import { bioActionsFor, type BioActions, type BioPhraseHandlers } from './bio-actions';
import { BIO_LINKS, BIO_PLACES_ACTION } from '$lib/bio-links';
import { CITIES } from '$lib/cities';
import type { PageTone } from '$lib/paper';

const WORK_IDS = ['amazon', 'msd', 'criisp'] as const;

function handlers(): BioPhraseHandlers {
  return { openMap: vi.fn(), openOldSite: vi.fn() };
}

function terminal(): BioActions {
  return bioActionsFor('terminal', handlers());
}

function paper(): BioActions {
  return bioActionsFor('paper', handlers());
}

function everyPhrase(actions: BioActions) {
  return [
    actions.years,
    actions.places,
    actions.continuousLearning,
    ...WORK_IDS.map((id) => actions.work(id)),
  ];
}

describe('bioActionsFor', () => {
  it('names every phrase for both tones, so the component never branches itself', () => {
    for (const actions of [terminal(), paper()]) {
      for (const phrase of everyPhrase(actions)) {
        expect(phrase.target.length).toBeGreaterThan(0);
        expect(phrase.label.length).toBeGreaterThan(0);
        expect(phrase.accent.length).toBeGreaterThan(0);
        expect(typeof phrase.hint).toBe('string');
      }
    }
  });

  it('gives every phrase a unique target, so no two notes share an id', () => {
    for (const actions of [terminal(), paper()]) {
      const targets = everyPhrase(actions).map((phrase) => phrase.target);

      expect(new Set(targets).size).toBe(targets.length);
    }
  });

  describe('terminal tone', () => {
    it('opens the old site from the years phrase, in place', () => {
      const openOldSite = vi.fn();
      const actions = bioActionsFor('terminal', { openMap: vi.fn(), openOldSite });
      const years = actions.years;

      expect(years.onActivate).toBe(openOldSite);
      expect(years.href).toBeUndefined();
      expect(years.hint).toBe('CLICK TO OPEN');
      expect(years.screenshot?.staticAssetPathWithDeployBase).toBe('/old-site.png');
    });

    it('opens the map from the places phrase, in place', () => {
      const openMap = vi.fn();
      const actions = bioActionsFor('terminal', { openMap, openOldSite: vi.fn() });
      const places = actions.places;

      expect(places.onActivate).toBe(openMap);
      expect(places.href).toBeUndefined();
      expect(places.hint).toBe('CLICK TO OPEN MAP');
      expect(places.note).toBe(BIO_PLACES_ACTION.note);
    });

    it('sends the curiosity phrase to the ethos page, unmarked', () => {
      const curiosity = terminal().continuousLearning;

      expect(curiosity.href).toBe('/ethos?highlight=continuous-learning');
      expect(curiosity.onActivate).toBeUndefined();
      expect(curiosity.hint).toBe('CLICK TO OPEN');
    });

    it('sends each named role to the experience entry that proves it', () => {
      const actions = terminal();

      for (const id of WORK_IDS) {
        const work = actions.work(id);

        expect(work.href).toBe(BIO_LINKS[id].href);
        expect(work.note).toBe(BIO_LINKS[id].note);
        expect(work.onActivate).toBeUndefined();
        expect(work.hint).toBe('CLICK TO OPEN');
      }
    });
  });

  describe('paper tone', () => {
    it('leaves the years phrase in place, with no hint and no modal to open', () => {
      const years = paper().years;

      expect(years.onActivate).toBeUndefined();
      expect(years.href).toBeUndefined();
      expect(years.hint).toBe('');
    });

    it('still previews the 2019 screenshot on the years phrase', () => {
      expect(paper().years.screenshot?.staticAssetPathWithDeployBase).toBe('/old-site.png');
    });

    it('keeps the places phrase inert, since the page has no map', () => {
      const places = paper().places;

      expect(places.onActivate).toBeUndefined();
      expect(places.href).toBeUndefined();
      expect(places.hint).toBe('');
    });

    it('names every city in the places note, so the phrase still explains itself', () => {
      const note = paper().places.note ?? '';

      for (const city of CITIES) {
        expect(note).toContain(city.name);
      }
    });

    it('marks the curiosity phrase as leaving the summary', () => {
      const curiosity = paper().continuousLearning;

      expect(curiosity.href).toBe('/ethos?highlight=continuous-learning&from=summary');
      expect(curiosity.hint).toBe('CLICK TO OPEN');
    });

    it('jumps each named role to its highlight further down the page', () => {
      const actions = paper();

      for (const id of WORK_IDS) {
        const work = actions.work(id);

        expect(work.href).toBe(`#experience-${id}`);
        expect(work.note).toBe(BIO_LINKS[id].note);
        expect(work.onActivate).toBeUndefined();
        expect(work.hint).toBe('JUMP TO HIGHLIGHT');
      }
    });

    it('forwards each work phrase activation to the jump handler with its trigger', () => {
      const jumpToWork = vi.fn();
      const actions = bioActionsFor('paper', { ...handlers(), jumpToWork });
      const event = new MouseEvent('click');
      const trigger = document.createElement('a');

      for (const id of WORK_IDS) {
        actions.work(id).onActivate?.(event, trigger);

        expect(jumpToWork).toHaveBeenCalledWith(id, trigger, event);
      }

      expect(jumpToWork).toHaveBeenCalledTimes(WORK_IDS.length);
    });
  });

  it('returns a strategy for every page tone', () => {
    for (const tone of ['terminal', 'paper'] as PageTone[]) {
      expect(everyPhrase(bioActionsFor(tone, handlers()))).toHaveLength(6);
    }
  });
});
