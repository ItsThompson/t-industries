import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import SectionHeading from './SectionHeading.svelte';

describe('SectionHeading', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders an h2 when level is 2', () => {
        const { container } = render(SectionHeading, { props: { level: 2, text: 'EXPERIENCE' } });
        const heading = container.querySelector('h2');
        expect(heading).toBeTruthy();
        expect(heading?.textContent).toContain('EXPERIENCE');
    });

    it('renders an h3 when level is 3', () => {
        const { container } = render(SectionHeading, { props: { level: 3, text: 'PROJECTS' } });
        const heading = container.querySelector('h3');
        expect(heading).toBeTruthy();
        expect(heading?.textContent).toContain('PROJECTS');
    });

    it('renders an h4 when level is 4', () => {
        const { container } = render(SectionHeading, { props: { level: 4, text: 'SUBSECTION' } });
        const heading = container.querySelector('h4');
        expect(heading).toBeTruthy();
        expect(heading?.textContent).toContain('SUBSECTION');
    });

    it('uses font-display class for VT323', () => {
        const { container } = render(SectionHeading, { props: { level: 2, text: 'TEST' } });
        const heading = container.querySelector('h2');
        expect(heading?.classList.contains('font-display')).toBe(true);
    });

    it('applies uppercase and tracking-wider', () => {
        const { container } = render(SectionHeading, { props: { level: 2, text: 'TEST' } });
        const heading = container.querySelector('h2');
        expect(heading?.classList.contains('uppercase')).toBe(true);
        expect(heading?.classList.contains('tracking-wider')).toBe(true);
    });

    it('renders 4 chevrons by default before heading text', () => {
        const { container } = render(SectionHeading, { props: { level: 2, text: 'TITLE' } });
        const heading = container.querySelector('h2');
        const content = heading?.textContent;
        expect(content).toContain('>>>>');
        expect(content).toContain('TITLE');
        const chevronIndex = content?.indexOf('>>>>') ?? -1;
        const titleIndex = content?.indexOf('TITLE') ?? -1;
        expect(chevronIndex).toBeLessThan(titleIndex);
    });

    it('renders custom chevron count when specified', () => {
        const { container } = render(SectionHeading, { props: { level: 2, text: 'TITLE', chevronCount: 6 } });
        const heading = container.querySelector('h2');
        const content = heading?.textContent;
        expect(content).toContain('>>>>>>');
    });

    it('renders Chevrons component with muted color', () => {
        const { container } = render(SectionHeading, { props: { level: 2, text: 'TITLE' } });
        const chevronSpan = container.querySelector('[aria-hidden="true"]');
        expect(chevronSpan?.classList.contains('text-secondary-200')).toBe(true);
    });

    it('uses display-lg for level 2', () => {
        const { container } = render(SectionHeading, { props: { level: 2, text: 'TEST' } });
        const heading = container.querySelector('h2');
        expect(heading?.classList.contains('display-lg')).toBe(true);
    });

    it('uses display-md for level 3', () => {
        const { container } = render(SectionHeading, { props: { level: 3, text: 'TEST' } });
        const heading = container.querySelector('h3');
        expect(heading?.classList.contains('display-md')).toBe(true);
    });

    it('uses display-md for level 4', () => {
        const { container } = render(SectionHeading, { props: { level: 4, text: 'TEST' } });
        const heading = container.querySelector('h4');
        expect(heading?.classList.contains('display-md')).toBe(true);
    });
});
