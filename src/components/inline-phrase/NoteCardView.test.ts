import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import NoteCardView from './NoteCardView.svelte';
import type { NoteScreenshot } from '$lib/bio-links';
import type { NoteCard } from './types';

const ACCENT = '#FF6363';
const RETURN_SYMBOL = '\u21B5';

const MEDIA: NoteScreenshot = {
    staticAssetPathWithDeployBase: '/old-site.png',
    alt: 'Screenshot of the first website',
    intrinsicPixelWidth: 2048,
    intrinsicPixelHeight: 1610,
};

const CARD: NoteCard = {
    label: 'Label / Test',
    note: 'A note that is long enough to describe what the action reveals.',
    hint: 'CLICK TO OPEN',
};

type Props = Record<string, unknown>;

function renderCard(props: Props = {}) {
    return render(NoteCardView, {
        props: {
            card: CARD,
            tone: 'terminal',
            accent: ACCENT,
            id: 'bio-note-test',
            activatable: true,
            open: false,
            left: 0,
            top: 0,
            ...props,
        },
    });
}

function card(container: HTMLElement): HTMLElement {
    const element = container.querySelector<HTMLElement>('[role="tooltip"]');
    if (!element) throw new Error('No card rendered');
    return element;
}

describe('NoteCardView', () => {
    afterEach(() => {
        cleanup();
    });

    it('names itself as the tooltip the trigger points at', () => {
        const { container } = renderCard();

        expect(card(container).getAttribute('id')).toBe('bio-note-test');
        expect(card(container).getAttribute('role')).toBe('tooltip');
    });

    it('leads with the label', () => {
        const { container } = renderCard();

        expect(card(container).firstElementChild?.textContent).toBe('Label / Test');
    });

    it('leaves out the description line when the card has no note', () => {
        const { container } = renderCard({ card: { label: 'Label / Test', media: MEDIA } });

        expect(card(container).textContent).not.toContain('A note that is long enough');
    });

    it('leaves out the hint line when the card has no hint', () => {
        const { container } = renderCard({ card: { label: 'Label / Test' } });

        expect(card(container).textContent).not.toContain('CLICK TO OPEN');
    });

    it('shows the hint when the card names one', () => {
        const { container } = renderCard();

        expect(card(container).textContent).toContain('CLICK TO OPEN');
    });

    it('adds the return symbol only for a phrase that opens something', () => {
        expect(card(renderCard().container).textContent).toContain(RETURN_SYMBOL);
        expect(
            card(renderCard({ activatable: false }).container).textContent
        ).not.toContain(RETURN_SYMBOL);
    });

    it('stays hidden until the reader asks for it', () => {
        expect(card(renderCard().container).className).toContain('invisible');
        expect(card(renderCard({ open: true }).container).className).toContain('visible');
    });

    it('moves with the placement it is given', () => {
        const { container } = renderCard({ left: 120, top: 48 });
        const element = card(container);

        expect(element.style.left).toBe('120px');
        expect(element.style.top).toBe('48px');
    });

    it('reports its own size, so placement stays out of the card', () => {
        const { container, component } = renderCard();
        card(container).getBoundingClientRect = () => new DOMRect(0, 0, 256, 96);

        const measured = (component as InstanceType<typeof NoteCardView>).measure();

        expect(measured.width).toBe(256);
        expect(measured.height).toBe(96);
    });

    describe('media', () => {
        it('fetches nothing before the card opens', () => {
            const { container } = renderCard({ card: { ...CARD, media: MEDIA } });

            expect(card(container).querySelector('img')).toBeNull();
        });

        it('renders the image with its alt text and intrinsic size once open', () => {
            const { container } = renderCard({ card: { ...CARD, media: MEDIA }, open: true });

            const image = card(container).querySelector('img');
            if (!image) throw new Error('No image rendered');

            expect(image.getAttribute('src')).toBe('/old-site.png');
            expect(image.getAttribute('alt')).toBe('Screenshot of the first website');
            // The declared size reserves the image box before the bytes arrive.
            expect(image.getAttribute('width')).toBe('2048');
            expect(image.getAttribute('height')).toBe('1610');
            expect(image.className).toContain('w-full');
        });

        it('drops the image again when the card closes', () => {
            const { container } = renderCard({ card: { ...CARD, media: MEDIA }, open: false });

            expect(card(container).querySelector('img')).toBeNull();
        });

        it('renders no image when the card has none', () => {
            const { container } = renderCard({ open: true });

            expect(card(container).querySelector('img')).toBeNull();
        });
    });

    describe('tone', () => {
        it('draws the terminal card on black, edged in the accent', () => {
            const element = card(renderCard().container);

            expect(element.className).toContain('bg-black');
            expect(element.getAttribute('style')).toContain('border-color');
        });

        it('draws the paper card raised, with no accent edge', () => {
            const element = card(renderCard({ tone: 'paper' }).container);
            const style = element.getAttribute('style') ?? '';

            expect(element.className).toContain('bg-paper-raised');
            expect(element.className).not.toContain('bg-black');
            expect(style).not.toContain('border-color');
            expect(style).not.toContain('undefined');
        });

        it('labels the paper card in ink, so the accent never carries text', () => {
            const element = card(renderCard({ tone: 'paper' }).container);
            const label = element.firstElementChild;

            if (!label) throw new Error('No label rendered');
            expect(label.className).toContain('text-paper-ink');
            expect(label.getAttribute('style')).toBeNull();
        });
    });
});
