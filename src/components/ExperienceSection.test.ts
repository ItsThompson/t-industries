import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import ExperienceSection from './ExperienceSection.svelte';

describe('ExperienceSection', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders a section with id="experience"', () => {
        const { container } = render(ExperienceSection);
        const section = container.querySelector('section#experience');
        expect(section).toBeTruthy();
    });

    it('renders SectionHeading with "EXPERIENCE" as h2', () => {
        const { container } = render(ExperienceSection);
        const heading = container.querySelector('h2');
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
        expect(text).toContain('Sep 2025 - Present');
        expect(text).toContain('Aug 2024 - Present');
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

    it('renders MetadataBar with experience cycles and org count', () => {
        const { container } = render(ExperienceSection);
        const text = container.textContent ?? '';
        expect(text).toMatch(/EXP\.CYCLES: \d+/);
        expect(text).toContain('ORGS: 5');
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
});
