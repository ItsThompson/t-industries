import { describe, it, expect } from 'vitest';
import { isOffscreen, pickLine, placeCard, type Rect } from './placement';

const VIEWPORT = { width: 1024, height: 768 };
const GAP = 8;
const MARGIN = 8;

const FIRST_LINE: Rect = { top: 100, left: 0, bottom: 120, right: 300, width: 300, height: 20 };
const SECOND_LINE: Rect = { top: 120, left: 0, bottom: 140, right: 120, width: 120, height: 20 };

describe('pickLine', () => {
    it('picks the line the pointer sits inside', () => {
        expect(pickLine([FIRST_LINE, SECOND_LINE], { x: 100, y: 130 })).toBe(SECOND_LINE);
        expect(pickLine([FIRST_LINE, SECOND_LINE], { x: 200, y: 110 })).toBe(FIRST_LINE);
    });

    it('picks the nearest line when the pointer sits past every line', () => {
        // Centres are (150, 110) and (60, 130), so the first line is closer.
        expect(pickLine([FIRST_LINE, SECOND_LINE], { x: 400, y: 400 })).toBe(FIRST_LINE);
    });

    it('picks the first line for a keyboard focus, which has no pointer', () => {
        expect(pickLine([FIRST_LINE, SECOND_LINE], null)).toBe(FIRST_LINE);
    });

    it('ignores lines that reported no size', () => {
        const empty: Rect = { top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0 };

        expect(pickLine([empty, SECOND_LINE], { x: 10, y: 130 })).toBe(SECOND_LINE);
    });

    it('reports nothing to anchor to when no line has a size', () => {
        const empty: Rect = { top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0 };

        expect(pickLine([empty], { x: 10, y: 130 })).toBeNull();
    });
});

describe('placeCard', () => {
    const CARD = { width: 200, height: 100 };

    function place(anchor: Rect) {
        return placeCard({ anchor, card: CARD, viewport: VIEWPORT, gap: GAP, margin: MARGIN });
    }

    it('centres the card over the anchor and sits it above', () => {
        const anchor: Rect = { top: 300, left: 400, bottom: 320, right: 500, width: 100, height: 20 };

        expect(place(anchor)).toEqual({ left: 350, top: 192 });
    });

    it('holds the card off the left edge', () => {
        const anchor: Rect = { top: 300, left: 0, bottom: 320, right: 20, width: 20, height: 20 };

        expect(place(anchor).left).toBe(MARGIN);
    });

    it('holds the card off the right edge', () => {
        const anchor: Rect = { top: 300, left: 1000, bottom: 320, right: 1024, width: 24, height: 20 };

        expect(place(anchor).left).toBe(VIEWPORT.width - CARD.width - MARGIN);
    });

    it('holds the card off the left edge on a viewport narrower than the card', () => {
        const anchor: Rect = { top: 300, left: 0, bottom: 320, right: 20, width: 20, height: 20 };

        expect(
            placeCard({ anchor, card: CARD, viewport: { width: 100, height: 768 }, gap: GAP, margin: MARGIN })
                .left
        ).toBe(MARGIN);
    });

    it('drops the card below the anchor when there is no room above', () => {
        const anchor: Rect = { top: 50, left: 400, bottom: 70, right: 500, width: 100, height: 20 };

        expect(place(anchor).top).toBe(anchor.bottom + GAP);
    });
});

describe('isOffscreen', () => {
    it('reports an anchor scrolled past the top', () => {
        expect(isOffscreen({ top: -60, left: 0, bottom: -40, right: 0, width: 0, height: 20 }, 768)).toBe(
            true
        );
    });

    it('reports an anchor scrolled past the bottom', () => {
        expect(isOffscreen({ top: 800, left: 0, bottom: 820, right: 0, width: 0, height: 20 }, 768)).toBe(
            true
        );
    });

    it('reports an anchor on screen', () => {
        expect(isOffscreen({ top: 100, left: 0, bottom: 120, right: 0, width: 0, height: 20 }, 768)).toBe(
            false
        );
    });
});
