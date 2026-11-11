import { describe, it, expect, vi } from 'vitest';
import { triggerFor } from './trigger';
import type { PhraseAction } from './types';

const ACCENT = '#FF6363';
const CARD = { label: 'Label / Test' };

describe('triggerFor', () => {
    it('renders a navigating phrase as an anchor, and leaves the link semantics native', () => {
        const action: PhraseAction = {
            kind: 'navigate',
            target: 'test',
            accent: ACCENT,
            href: '/experience',
            card: CARD,
        };

        expect(triggerFor(action)).toEqual({
            element: 'a',
            attributes: { href: '/experience' },
            role: undefined,
        });
    });

    it('gives an in-place phrase button semantics on a span, so it wraps like prose', () => {
        const action: PhraseAction = {
            kind: 'activate',
            target: 'test',
            accent: ACCENT,
            card: CARD,
            onActivate: vi.fn(),
        };

        expect(triggerFor(action)).toEqual({
            element: 'span',
            attributes: { tabindex: 0 },
            role: 'button',
        });
    });

    it('gives a reveal-only phrase focus without claiming a role', () => {
        const action: PhraseAction = { kind: 'describe', target: 'test', accent: ACCENT, card: CARD };

        expect(triggerFor(action)).toEqual({
            element: 'span',
            attributes: { tabindex: 0 },
            role: undefined,
        });
    });

    it('leaves a phrase without a card navigable', () => {
        const action: PhraseAction = {
            kind: 'navigate',
            target: 'test',
            accent: ACCENT,
            href: '#experience-amazon',
        };

        expect(triggerFor(action).element).toBe('a');
    });
});
