import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/svelte';
import { tick } from 'svelte';
import InlinePhrase from './InlinePhrase.svelte';
import type { NoteScreenshot } from '$lib/bio-links';
import type { Activate, NoteCard, PhraseAction } from './types';

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

function reveal(card: NoteCard = CARD): PhraseAction {
    return { kind: 'describe', target: 'test', accent: ACCENT, card };
}

function act(onActivate: Activate = vi.fn(), card: NoteCard = CARD): PhraseAction {
    return { kind: 'activate', target: 'test', accent: ACCENT, card, onActivate };
}

function navigate(props: { href?: string; card?: NoteCard; onActivate?: Activate } = {}): PhraseAction {
    return {
        kind: 'navigate',
        target: 'test',
        accent: ACCENT,
        href: props.href ?? '/experience',
        card: 'card' in props ? props.card : CARD,
        onActivate: props.onActivate,
    };
}

function renderPhrase(action: PhraseAction, tone?: 'terminal' | 'paper') {
    return render(InlinePhrase, { props: { action, ...(tone ? { tone } : {}) } });
}

function trigger(container: HTMLElement): HTMLElement {
    const element = container.firstElementChild;
    if (!element) throw new Error('No phrase rendered');
    return element as HTMLElement;
}

function cardFor(container: HTMLElement): HTMLElement {
    const element = container.querySelector<HTMLElement>('[role="tooltip"]');
    if (!element) throw new Error('No card rendered');
    return element;
}

describe('InlinePhrase', () => {
    afterEach(() => {
        cleanup();
    });

    describe('placing the card', () => {
        const FIRST_LINE = new DOMRect(0, 100, 300, 20);
        const SECOND_LINE = new DOMRect(0, 120, 120, 20);

        /** A phrase that wrapped, so the browser reports one rect per line. */
        function wrapAcrossTwoLines(element: HTMLElement): void {
            element.getClientRects = () => [FIRST_LINE, SECOND_LINE] as unknown as DOMRectList;
            // The union spans the paragraph, which is what made the card land badly.
            element.getBoundingClientRect = () => new DOMRect(0, 100, 300, 40);
        }

        function cardLeft(container: HTMLElement): string | undefined {
            return cardFor(container).style.left;
        }

        it('anchors the card to the line the pointer is on', async () => {
            const { container } = renderPhrase(reveal());
            const element = trigger(container);
            wrapAcrossTwoLines(element);

            // Inside the second, shorter line.
            await fireEvent.mouseEnter(element, { clientX: 100, clientY: 130 });
            await tick();

            // Centred on the 120px line, not on the 300px union of both.
            expect(cardLeft(container)).toBe('60px');
        });

        it('follows the pointer as it moves between lines', async () => {
            const { container } = renderPhrase(reveal());
            const element = trigger(container);
            wrapAcrossTwoLines(element);

            await fireEvent.mouseEnter(element, { clientX: 200, clientY: 110 });
            await tick();
            expect(cardLeft(container)).toBe('150px');

            await fireEvent.mouseMove(element, { clientX: 100, clientY: 130 });
            await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
            await tick();

            expect(cardLeft(container)).toBe('60px');
        });

        it('anchors to the first line when focus opens the card', async () => {
            const { container } = renderPhrase(reveal());
            wrapAcrossTwoLines(trigger(container));

            await fireEvent.focus(trigger(container));
            await tick();

            expect(cardLeft(container)).toBe('150px');
        });

        it('closes the card once its phrase scrolls out of view', async () => {
            const { container } = renderPhrase(reveal());
            const element = trigger(container);
            element.getBoundingClientRect = () =>
                ({
                    top: window.innerHeight + 100,
                    bottom: window.innerHeight + 120,
                    left: 0,
                    width: 0,
                    height: 0,
                }) as DOMRect;

            await fireEvent.focus(element);
            await tick();
            await fireEvent.scroll(window);
            await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
            await tick();

            expect(cardFor(container).className).toContain('invisible');
        });
    });

    describe('trigger semantics', () => {
        it('renders an anchor with the given destination, leaving link semantics native', () => {
            const { container } = renderPhrase(navigate({ href: '/experience' }));
            const element = trigger(container);

            expect(element.tagName).toBe('A');
            expect(element.getAttribute('href')).toBe('/experience');
            expect(element.hasAttribute('role')).toBe(false);
        });

        it('gives a phrase that acts in place button semantics, on a span', async () => {
            const onActivate = vi.fn();
            const { container } = renderPhrase(act(onActivate));
            const element = trigger(container);

            // A span keeps the phrase in the text flow, so it wraps like prose.
            expect(element.tagName).toBe('SPAN');
            expect(element.getAttribute('role')).toBe('button');
            expect(element.getAttribute('tabindex')).toBe('0');

            await fireEvent.click(element);
            expect(onActivate).toHaveBeenCalledTimes(1);
        });

        it('activates a span phrase from the keyboard', async () => {
            const onActivate = vi.fn();
            const { container } = renderPhrase(act(onActivate));
            const element = trigger(container);

            await fireEvent.keyDown(element, { key: 'Enter' });
            expect(onActivate).toHaveBeenCalledTimes(1);

            await fireEvent.keyDown(element, { key: ' ' });
            expect(onActivate).toHaveBeenCalledTimes(2);
        });

        it('hands the trigger element to the handler, for callers that need its position', async () => {
            const onActivate = vi.fn();
            const { container } = renderPhrase(act(onActivate));
            const element = trigger(container);

            await fireEvent.click(element);
            expect(onActivate.mock.calls[0][1]).toBe(element);

            await fireEvent.keyDown(element, { key: 'Enter' });
            expect(onActivate.mock.calls[1][1]).toBe(element);
        });

        it('marks a keyboard activation as such, so focus can return on close', async () => {
            const onActivate = vi.fn();
            const { container } = renderPhrase(act(onActivate));

            await fireEvent.keyDown(trigger(container), { key: 'Enter' });

            expect(onActivate.mock.calls[0][0].detail).toBe(0);
        });

        it('renders a focusable span when the phrase only reveals its card', () => {
            const { container } = renderPhrase(reveal());
            const element = trigger(container);

            expect(element.tagName).toBe('SPAN');
            expect(element.getAttribute('tabindex')).toBe('0');
            expect(element.hasAttribute('role')).toBe(false);
            expect(element.hasAttribute('href')).toBe(false);
            expect(container.querySelector('a')).toBeNull();
            expect(container.querySelector('button')).toBeNull();
        });

        it('describes the trigger with its card, in the document', () => {
            const { container } = renderPhrase(reveal());
            const element = trigger(container);

            expect(element.getAttribute('aria-describedby')).toBe(cardFor(container).id);
        });
    });

    describe('a phrase with no card', () => {
        function cardless(props: { onActivate?: Activate } = {}): PhraseAction {
            return {
                kind: 'navigate',
                target: 'test',
                accent: ACCENT,
                href: '#experience-amazon',
                onActivate: props.onActivate,
            };
        }

        it('renders a plain link, with no card to describe it', () => {
            const { container } = renderPhrase(cardless());
            const element = trigger(container);

            expect(element.tagName).toBe('A');
            expect(element.getAttribute('href')).toBe('#experience-amazon');
            expect(element.hasAttribute('aria-describedby')).toBe(false);
            expect(container.querySelector('[role="tooltip"]')).toBeNull();
        });

        it('follows its destination, since nothing else can happen', async () => {
            const { container } = renderPhrase(cardless());

            await fireEvent.click(trigger(container));
            await tick();

            expect(trigger(container).getAttribute('href')).toBe('#experience-amazon');
        });

        it('hands the click to its handler, which can keep the page in place', async () => {
            const onActivate = vi.fn();
            const { container } = renderPhrase(cardless({ onActivate }));

            await fireEvent.click(trigger(container));

            expect(onActivate).toHaveBeenCalledTimes(1);
        });

        it('leaves keyboard activation to the browser, so Enter follows the link', async () => {
            const onActivate = vi.fn();
            const { container } = renderPhrase(cardless({ onActivate }));

            await fireEvent.keyDown(trigger(container), { key: 'Enter' });

            expect(onActivate).not.toHaveBeenCalled();
        });

        it('reveals nothing on hover or focus', async () => {
            const { container } = renderPhrase(cardless());

            await fireEvent.mouseEnter(trigger(container));
            await tick();
            await fireEvent.focus(trigger(container));
            await tick();

            expect(container.querySelector('[role="tooltip"]')).toBeNull();
        });
    });

    describe('revealing the card', () => {
        it('keeps the card hidden until the reader asks for it', () => {
            const { container } = renderPhrase(reveal());

            expect(cardFor(container).className).toContain('invisible');
        });

        it('shows the card on hover', async () => {
            const { container } = renderPhrase(reveal());

            await fireEvent.mouseEnter(trigger(container));
            await tick();

            expect(cardFor(container).className).toContain('visible');
        });

        it('shows the card on keyboard focus', async () => {
            const { container } = renderPhrase(reveal());

            await fireEvent.focus(trigger(container));
            await tick();

            expect(cardFor(container).className).toContain('visible');
        });

        it('hides the card when the pointer leaves', async () => {
            const { container } = renderPhrase(reveal());

            await fireEvent.mouseEnter(trigger(container));
            await tick();
            await fireEvent.mouseLeave(trigger(container));
            await tick();

            expect(cardFor(container).className).toContain('invisible');
        });

        it('hides the card on Escape', async () => {
            const { container } = renderPhrase(reveal());

            await fireEvent.focus(trigger(container));
            await tick();
            await fireEvent.keyDown(trigger(container), { key: 'Escape' });
            await tick();

            expect(cardFor(container).className).toContain('invisible');
        });
    });

    describe('activating the card', () => {
        it('marks an anchor as opening a target', () => {
            const { container } = renderPhrase(navigate({ href: '/experience' }));

            expect(cardFor(container).textContent).toContain(RETURN_SYMBOL);
        });

        it('marks an in-place phrase as opening a target', () => {
            const { container } = renderPhrase(act());

            expect(cardFor(container).textContent).toContain(RETURN_SYMBOL);
        });

        it('leaves the return symbol off a phrase that only reveals its card', () => {
            const { container } = renderPhrase(reveal());

            expect(cardFor(container).textContent).not.toContain(RETURN_SYMBOL);
        });
    });

    describe('media in the card', () => {
        it('fetches nothing before the card opens', () => {
            const { container } = renderPhrase(reveal({ label: 'Label / Test', media: MEDIA }));

            expect(cardFor(container).querySelector('img')).toBeNull();
        });

        it('renders the image with its alt text and intrinsic size once open', async () => {
            const { container } = renderPhrase(reveal({ label: 'Label / Test', media: MEDIA }));

            await fireEvent.focus(trigger(container));
            await tick();

            const image = cardFor(container).querySelector('img');
            if (!image) throw new Error('No image rendered');

            expect(image.getAttribute('src')).toBe('/old-site.png');
            expect(image.getAttribute('alt')).toBe('Screenshot of the first website');
            expect(image.getAttribute('width')).toBe('2048');
            expect(image.getAttribute('height')).toBe('1610');
            expect(image.className).toContain('w-full');
        });

        it('drops the image again when the card closes', async () => {
            const { container } = renderPhrase(reveal({ label: 'Label / Test', media: MEDIA }));

            await fireEvent.focus(trigger(container));
            await tick();
            await fireEvent.blur(trigger(container));
            await tick();

            expect(cardFor(container).querySelector('img')).toBeNull();
        });

        it('renders no image when the card has none', async () => {
            const { container } = renderPhrase(reveal());

            await fireEvent.focus(trigger(container));
            await tick();

            expect(cardFor(container).querySelector('img')).toBeNull();
        });

        it('leaves out the description line when the card has no note', async () => {
            const { container } = renderPhrase(reveal({ label: 'Label / Test', media: MEDIA }));

            await fireEvent.focus(trigger(container));
            await tick();

            const card = cardFor(container);
            expect(card.querySelector('img')).toBeTruthy();
            expect(card.textContent).toContain('Label / Test');
            expect(card.textContent).not.toContain('A note that is long enough');
        });
    });

    describe('paper tone', () => {
        function paperPhrase(action: PhraseAction = reveal()) {
            return renderPhrase(action, 'paper');
        }

        it('paints a band behind the words instead of a dotted underline', () => {
            const element = trigger(paperPhrase().container);

            expect(element.className).toContain('rgba(var(--band)');
            expect(element.className).not.toContain('border-dotted');
        });

        it('takes the band color from the accent, without painting the glyphs', () => {
            const element = trigger(paperPhrase().container);

            expect(element.style.getPropertyValue('--band')).toBe('255,99,99');
            expect(element.style.getPropertyValue('--band-alpha')).toBe('0.4');
            expect(element.style.getPropertyValue('--band-alpha-hover')).toBe('0.54');
            expect(element.style.color).toBe('');
        });

        it('clones the band across lines, so a wrapped phrase keeps its edges', () => {
            expect(trigger(paperPhrase().container).className).toContain(
                '[box-decoration-break:clone]'
            );
        });

        it('outlines focus in ink, because a light accent is invisible on paper', () => {
            expect(trigger(paperPhrase().container).className).toContain(
                'focus-visible:outline-paper-ink'
            );
        });

        it('renders the card on a paper card rather than a black one', () => {
            const { container } = paperPhrase();

            expect(cardFor(container).className).toContain('bg-paper-raised');
            expect(cardFor(container).className).not.toContain('bg-black');
        });

        it('keeps the accent border off the card', () => {
            const style = cardFor(paperPhrase().container).getAttribute('style') ?? '';

            expect(style).not.toContain('border-color');
            expect(style).not.toContain('undefined');
        });

        it('labels the card in ink, so the accent never carries text', () => {
            const label = cardFor(paperPhrase().container).firstElementChild;

            if (!label) throw new Error('No label rendered');
            expect(label.className).toContain('text-paper-ink');
            expect(label.getAttribute('style')).toBeNull();
        });

        it('gives a reveal-only phrase the help cursor, and no destination', () => {
            const { container } = paperPhrase();
            const element = trigger(container);

            expect(element.tagName).toBe('SPAN');
            expect(element.getAttribute('tabindex')).toBe('0');
            expect(element.hasAttribute('href')).toBe(false);
            expect(element.getAttribute('aria-describedby')).toBe(cardFor(container).id);
            expect(element.className).toContain('cursor-help');
        });

        it('keeps the navigation cursor on a phrase that goes somewhere', () => {
            const { container } = paperPhrase(navigate());

            expect(trigger(container).className).not.toContain('cursor-help');
        });

        it('leaves out the hint line when the card names none', async () => {
            const { container } = paperPhrase(reveal({ label: 'Label / Test' }));

            await fireEvent.focus(trigger(container));
            await tick();

            expect(cardFor(container).textContent).not.toContain('CLICK TO OPEN');
        });

        it('still shows the hint line when the card names one', async () => {
            const { container } = paperPhrase(reveal({ label: 'Label / Test', hint: 'JUMP HERE' }));

            await fireEvent.focus(trigger(container));
            await tick();

            expect(cardFor(container).textContent).toContain('JUMP HERE');
        });

        it('keeps the card position logic, so a paper card lands on its line', async () => {
            const { container } = paperPhrase();
            const element = trigger(container);
            element.getClientRects = () => [new DOMRect(0, 100, 300, 20)] as unknown as DOMRectList;
            element.getBoundingClientRect = () => new DOMRect(0, 100, 300, 20);

            await fireEvent.mouseEnter(element, { clientX: 150, clientY: 110 });
            await tick();

            expect(cardFor(container).style.left).toBe('150px');
        });
    });
});
