import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import ExperienceSection from './ExperienceSection.svelte';

describe('ExperienceSection', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders the section with id="experience"', () => {
        const { container } = render(ExperienceSection);
        const section = container.querySelector('section#experience');
        expect(section).toBeTruthy();
    });

    it('renders a Divider with label "EXPERIENCE"', () => {
        const { container } = render(ExperienceSection);
        const divider = container.querySelector('[aria-hidden="true"]');
        expect(divider?.textContent).toContain('EXPERIENCE');
    });

    it('renders SectionHeading with "EXPERIENCE LOG" as h2', () => {
        const { container } = render(ExperienceSection);
        const heading = container.querySelector('h2');
        expect(heading).toBeTruthy();
        expect(heading?.textContent).toContain('EXPERIENCE LOG');
    });

    it('renders all 5 experience entries', () => {
        const { container } = render(ExperienceSection);
        const compartments = container.querySelectorAll('.border.border-secondary-200.bg-black');
        expect(compartments.length).toBe(5);
    });

    it('displays company name in each compartment title', () => {
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

    it('renders a 2-column grid on desktop', () => {
        const { container } = render(ExperienceSection);
        const grid = container.querySelector('.grid');
        expect(grid?.classList.contains('grid-cols-1')).toBe(true);
        expect(grid?.classList.contains('md:grid-cols-2')).toBe(true);
    });

    it('renders MetadataBar with experience cycles and org count', () => {
        const { container } = render(ExperienceSection);
        const text = container.textContent ?? '';
        expect(text).toMatch(/EXP\.CYCLES: \d+/);
        expect(text).toContain('ORGS: 5');
    });

    it('renders crosshair markers at section corners', () => {
        const { container } = render(ExperienceSection);
        const crosshairs = container.querySelectorAll('[aria-hidden="true"].text-secondary-200.font-mono');
        // Filter for just the + crosshairs (not the divider)
        const plusMarkers = Array.from(crosshairs).filter(
            (element) => element.textContent?.trim() === '+'
        );
        expect(plusMarkers.length).toBe(4);
    });

    it('hides crosshair markers on mobile (hidden md:block)', () => {
        const { container } = render(ExperienceSection);
        const crosshairWrappers = container.querySelectorAll('.hidden.md\\:block');
        expect(crosshairWrappers.length).toBe(4);
    });

    it('uses the section as relative container for crosshair positioning', () => {
        const { container } = render(ExperienceSection);
        const section = container.querySelector('section#experience');
        expect(section?.classList.contains('relative')).toBe(true);
    });
});
