import { describe, it, expect, vi } from 'vitest';
import { bioActionsFor, type BioActions, type BioPhraseHandlers } from './bio-actions';
import { BIO_LINKS, BIO_PLACES_ACTION } from '$lib/bio-links';
import { CITIES } from '$lib/cities';
import type { PhraseAction } from './inline-phrase';
import type { PageMode } from '$lib/canvas';

const WORK_IDS = ['amazon', 'msd', 'criisp'] as const;

function handlers(): BioPhraseHandlers {
    return { openMap: vi.fn(), openOldSite: vi.fn() };
}

function terminal(): BioActions {
    return bioActionsFor('terminal', handlers());
}

function canvas(): BioActions {
    return bioActionsFor('canvas', handlers());
}

function everyPhrase(actions: BioActions): PhraseAction[] {
    return [
        actions.years,
        actions.places,
        actions.continuousLearning,
        ...WORK_IDS.map((id) => actions.work(id)),
    ];
}

function cardOf(action: PhraseAction) {
    if (!action.card) throw new Error(`phrase "${action.target}" has no card`);
    return action.card;
}

function hrefOf(action: PhraseAction): string | undefined {
    return action.kind === 'navigate' ? action.href : undefined;
}

function activateOf(action: PhraseAction) {
    return action.kind === 'describe' ? undefined : action.onActivate;
}

describe('bioActionsFor', () => {
    it('names every phrase for both modes, and labels every card they carry', () => {
        for (const actions of [terminal(), canvas()]) {
            for (const phrase of everyPhrase(actions)) {
                expect(phrase.target.length).toBeGreaterThan(0);
                expect(phrase.accent.length).toBeGreaterThan(0);
                if (phrase.card) expect(phrase.card.label.length).toBeGreaterThan(0);
            }
        }
    });

    it('gives every phrase a unique target, so no two cards share an id', () => {
        for (const actions of [terminal(), canvas()]) {
            const targets = everyPhrase(actions).map((phrase) => phrase.target);

            expect(new Set(targets).size).toBe(targets.length);
        }
    });

    describe('terminal mode', () => {
        it('opens the old site from the years phrase, in place', () => {
            const openOldSite = vi.fn();
            const actions = bioActionsFor('terminal', { openMap: vi.fn(), openOldSite });
            const years = actions.years;

            expect(years.kind).toBe('activate');
            expect(activateOf(years)).toBe(openOldSite);
            expect(hrefOf(years)).toBeUndefined();
            expect(cardOf(years).hint).toBe('CLICK TO OPEN');
            expect(cardOf(years).media?.staticAssetPathWithDeployBase).toBe('/old-site.png');
        });

        it('opens the map from the places phrase, in place', () => {
            const openMap = vi.fn();
            const actions = bioActionsFor('terminal', { openMap, openOldSite: vi.fn() });
            const places = actions.places;

            expect(places.kind).toBe('activate');
            expect(activateOf(places)).toBe(openMap);
            expect(hrefOf(places)).toBeUndefined();
            expect(cardOf(places).hint).toBe('CLICK TO OPEN MAP');
            expect(cardOf(places).note).toBe(BIO_PLACES_ACTION.note);
        });

        it('sends the curiosity phrase to the ethos page, unmarked', () => {
            const curiosity = terminal().continuousLearning;

            expect(hrefOf(curiosity)).toBe('/terminal/ethos?highlight=continuous-learning');
            expect(activateOf(curiosity)).toBeUndefined();
            expect(cardOf(curiosity).hint).toBe('CLICK TO OPEN');
        });

        it('sends each named role to the experience entry that proves it', () => {
            const actions = terminal();

            for (const id of WORK_IDS) {
                const work = actions.work(id);

                expect(work.kind).toBe('navigate');
                expect(hrefOf(work)).toBe(BIO_LINKS[id].href);
                expect(cardOf(work).label).toBe(BIO_LINKS[id].label);
                expect(cardOf(work).note).toBe(BIO_LINKS[id].note);
                expect(cardOf(work).hint).toBe('CLICK TO OPEN');
                expect(activateOf(work)).toBeUndefined();
            }
        });
    });

    describe('canvas mode', () => {
        it('leaves the years phrase revealing its screenshot, with no hint', () => {
            const years = canvas().years;

            expect(years.kind).toBe('describe');
            expect(activateOf(years)).toBeUndefined();
            expect(hrefOf(years)).toBeUndefined();
            expect(cardOf(years).hint).toBeUndefined();
            expect(cardOf(years).media?.staticAssetPathWithDeployBase).toBe('/old-site.png');
        });

        it('keeps the places phrase inert, since the page has no map', () => {
            const places = canvas().places;

            expect(places.kind).toBe('describe');
            expect(activateOf(places)).toBeUndefined();
            expect(hrefOf(places)).toBeUndefined();
            expect(cardOf(places).hint).toBeUndefined();
        });

        it('names every city in the places card, so the phrase still explains itself', () => {
            const note = cardOf(canvas().places).note ?? '';

            for (const city of CITIES) {
                expect(note).toContain(city.name);
            }
        });

        it('marks the curiosity phrase as leaving the canvas', () => {
            const curiosity = canvas().continuousLearning;

            expect(hrefOf(curiosity)).toBe('/terminal/ethos?highlight=continuous-learning&from=canvas');
            expect(cardOf(curiosity).hint).toBe('CLICK TO OPEN');
        });

        it('jumps each named role to its highlight without repeating it in a card', () => {
            const actions = canvas();

            for (const id of WORK_IDS) {
                const work = actions.work(id);

                expect(work.kind).toBe('navigate');
                expect(hrefOf(work)).toBe(`#experience-${id}`);
                expect(work.card).toBeUndefined();
            }
        });

        it('forwards each work phrase activation to the jump handler with its trigger', () => {
            const jumpToWork = vi.fn();
            const actions = bioActionsFor('canvas', { ...handlers(), jumpToWork });
            const event = new MouseEvent('click');
            const trigger = document.createElement('a');

            for (const id of WORK_IDS) {
                const work = actions.work(id);
                if (work.kind !== 'navigate') throw new Error('work phrase must navigate');
                work.onActivate?.(event, trigger);

                expect(jumpToWork).toHaveBeenCalledWith(id, trigger, event);
            }

            expect(jumpToWork).toHaveBeenCalledTimes(WORK_IDS.length);
        });

        it('leaves a role a plain anchor when the page passes no jump handler', () => {
            const work = bioActionsFor('canvas', handlers()).work('amazon');

            expect(activateOf(work)).toBeUndefined();
        });
    });

    it('returns a strategy for every page mode', () => {
        for (const mode of ['terminal', 'canvas'] as PageMode[]) {
            expect(everyPhrase(bioActionsFor(mode, handlers()))).toHaveLength(6);
        }
    });
});
