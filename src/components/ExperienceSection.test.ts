import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import { tick } from 'svelte';
import ExperienceSection from './ExperienceSection.svelte';
import { resetPageRoute, setPageUrl } from '$lib/__mocks__/app-stores';

function nextFrame(): Promise<void> {
    return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

describe('ExperienceSection', () => {
    beforeEach(() => {
        resetPageRoute();
    });

    afterEach(async () => {
        // Let a deferred reveal land before the document is torn down, so it
        // cannot scroll an element belonging to the next test.
        await nextFrame();
        cleanup();
        vi.restoreAllMocks();
        delete (Element.prototype as unknown as { scrollIntoView?: unknown }).scrollIntoView;
        resetPageRoute();
    });

    it('renders a section with id="experience"', () => {
        const { container } = render(ExperienceSection);
        const section = container.querySelector('section#experience');
        expect(section).toBeTruthy();
    });

    it('renders SectionHeading with "EXPERIENCE" as h1', () => {
        const { container } = render(ExperienceSection);
        const heading = container.querySelector('h1');
        expect(heading).toBeTruthy();
        expect(heading?.textContent).toContain('EXPERIENCE');
    });

    it('renders a vertical timeline line', () => {
        const { container } = render(ExperienceSection);
        const line = container.querySelector('.bg-secondary-200.w-px');
        expect(line).toBeTruthy();
    });

    it('renders coral dot markers for each experience entry', () => {
        const { container } = render(ExperienceSection);
        const dots = container.querySelectorAll('.bg-primary.rounded-full');
        // Each experience has a desktop dot + mobile dot = 2 per entry, 5 entries = 10
        expect(dots.length).toBe(10);
    });

    it('renders all 5 experience entries with company names', () => {
        const { container } = render(ExperienceSection);
        const text = container.textContent ?? '';
        expect(text).toContain('Amazon (Veeqo)');
        expect(text).toContain('University of Bath CRIISP');
        expect(text).toContain('MSD');
        expect(text).toContain('Coding For All');
        expect(text).toContain('Coding For Good');
    });

    it('displays role for each experience', () => {
        const { container } = render(ExperienceSection);
        const text = container.textContent ?? '';
        expect(text).toContain('Front-End Engineer');
        expect(text).toContain('Research Assistant');
        expect(text).toContain('MLOps Intern, GenAI');
        expect(text).toContain('Co-Founder');
        expect(text).toContain('Project Manager & Engineer');
    });

    it('displays date range for each experience', () => {
        const { container } = render(ExperienceSection);
        const text = container.textContent ?? '';
        expect(text).toContain('Sep 2025 - Sep 2026');
        expect(text).toContain('Aug 2024 - Sep 2025');
        expect(text).toContain('Jun 2024 - Jul 2024');
        expect(text).toContain('Sep 2021 - Dec 2023');
        expect(text).toContain('Dec 2021 - Feb 2023');
    });

    it('displays description text for each experience', () => {
        const { container } = render(ExperienceSection);
        const text = container.textContent ?? '';
        expect(text).toContain('Reduced frontend build times');
        expect(text).toContain('Reduced SEM creation time');
        expect(text).toContain('Reduced document processing time');
        expect(text).toContain('Founded a programming education initiative');
        expect(text).toContain('Led a team of 6 engineers');
    });

    it('alternates cards left and right on desktop', () => {
        const { container } = render(ExperienceSection);
        // Each entry uses a 3-column grid (1fr auto 1fr) for alternating layout
        const section = container.querySelector('section#experience');
        const gridEntries = section?.querySelectorAll('[class*="grid-cols-"][class*="1fr"]');
        expect(gridEntries?.length).toBe(5);
    });

    it('renders mobile cards with left padding for timeline offset', () => {
        const { container } = render(ExperienceSection);
        const mobileCards = container.querySelectorAll('.md\\:hidden.pl-8');
        expect(mobileCards.length).toBe(5);
    });

    it('renders MetadataBar with org count', () => {
        const { container } = render(ExperienceSection);
        const text = container.textContent ?? '';
        expect(text).toContain('ORGS: 5');
        expect(text).not.toContain('EXP.CYCLES');
    });

    it('renders crosshair markers at section corners', () => {
        const { container } = render(ExperienceSection);
        const crosshairWrappers = container.querySelectorAll('.hidden.md\\:block.absolute');
        expect(crosshairWrappers.length).toBe(4);
    });

    it('uses the section as relative container for crosshair positioning', () => {
        const { container } = render(ExperienceSection);
        const section = container.querySelector('section#experience');
        expect(section?.classList.contains('relative')).toBe(true);
    });

    describe('highlighted by a bio link', () => {
        function stubScrollIntoView(): ReturnType<typeof vi.fn> {
            const scrollIntoView = vi.fn();
            (Element.prototype as unknown as { scrollIntoView: unknown }).scrollIntoView =
                scrollIntoView;
            return scrollIntoView;
        }

        function highlightedRows(container: HTMLElement): Element[] {
            return Array.from(container.querySelectorAll('[data-highlighted="true"]'));
        }

        it('marks nothing when no target is requested', () => {
            const { container } = render(ExperienceSection);
            expect(highlightedRows(container)).toHaveLength(0);
        });

        it('marks only the requested entry', () => {
            setPageUrl('/experience', '?highlight=msd');

            const { container } = render(ExperienceSection);
            const rows = highlightedRows(container);

            expect(rows).toHaveLength(1);
            expect(rows[0].getAttribute('data-experience-id')).toBe('msd');
        });

        it('gives the requested entry an anchor another route can scroll to', () => {
            setPageUrl('/experience', '?highlight=criisp');

            const { container } = render(ExperienceSection);

            expect(container.querySelector('#experience-criisp')).toBeTruthy();
        });

        it('centers the requested entry in the scroll region', async () => {
            const scrollIntoView = stubScrollIntoView();
            setPageUrl('/experience', '?highlight=amazon');

            render(ExperienceSection);
            await nextFrame();

            expect(scrollIntoView).toHaveBeenCalledWith(
                expect.objectContaining({ block: 'center' })
            );
            const scrolledElement = scrollIntoView.mock.instances[0] as unknown as HTMLElement;
            expect(scrolledElement.id).toBe('experience-amazon');
        });

        it('paints the requested entry in the organization brand color', () => {
            setPageUrl('/experience', '?highlight=msd');

            const { container } = render(ExperienceSection);
            const row = container.querySelector('[data-experience-id="msd"]');
            const compartment = row?.querySelector('.border.bg-black');

            expect(compartment?.getAttribute('style')).toContain('border-color: rgb(0, 148, 132)');
        });

        it('leaves the entry text untouched, so the highlight is the only signal', () => {
            setPageUrl('/experience', '?highlight=msd');

            const { container } = render(ExperienceSection);
            const row = container.querySelector('[data-experience-id="msd"]');

            expect(row?.textContent).not.toContain('LINKED FROM BIO');
            expect(row?.textContent).toContain('MLOps Intern, GenAI');
        });

        it('ignores a target that names no entry', async () => {
            const scrollIntoView = stubScrollIntoView();
            setPageUrl('/experience', '?highlight=does-not-exist');

            const { container } = render(ExperienceSection);
            await nextFrame();

            expect(highlightedRows(container)).toHaveLength(0);
            expect(scrollIntoView).not.toHaveBeenCalled();
        });

        it('drops the highlight when the query param goes away', async () => {
            setPageUrl('/experience', '?highlight=msd');

            const { container } = render(ExperienceSection);
            expect(highlightedRows(container)).toHaveLength(1);

            setPageUrl('/experience');
            await tick();

            expect(highlightedRows(container)).toHaveLength(0);
        });
    });
});
