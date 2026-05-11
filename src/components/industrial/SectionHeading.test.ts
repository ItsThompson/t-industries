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

    it('renders optional prefix before heading text', () => {
        const { container } = render(SectionHeading, { props: { level: 2, text: 'TITLE', prefix: '>>>>' } });
        const heading = container.querySelector('h2');
        const content = heading?.textContent;
        expect(content).toContain('>>>>');
        expect(content).toContain('TITLE');
        const prefixIndex = content?.indexOf('>>>>') ?? -1;
        const titleIndex = content?.indexOf('TITLE') ?? -1;
        expect(prefixIndex).toBeLessThan(titleIndex);
    });

    it('renders optional suffix after heading text', () => {
        const { container } = render(SectionHeading, { props: { level: 2, text: 'TITLE', suffix: 'TI-0510' } });
        const heading = container.querySelector('h2');
        const content = heading?.textContent;
        expect(content).toContain('TITLE');
        expect(content).toContain('TI-0510');
        const titleIndex = content?.indexOf('TITLE') ?? -1;
        const suffixIndex = content?.indexOf('TI-0510') ?? -1;
        expect(titleIndex).toBeLessThan(suffixIndex);
    });

    it('renders without prefix or suffix when not provided', () => {
        const { container } = render(SectionHeading, { props: { level: 2, text: 'SIMPLE' } });
        const heading = container.querySelector('h2');
        expect(heading?.textContent?.trim()).toBe('SIMPLE');
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
