import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import Chevrons from './Chevrons.svelte';

describe('Chevrons', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders 4 chevrons by default', () => {
        const { container } = render(Chevrons);
        const span = container.querySelector('span');
        expect(span?.textContent).toBe('>>>>');
    });

    it('renders the specified count of chevrons', () => {
        const { container } = render(Chevrons, { props: { count: 8 } });
        const span = container.querySelector('span');
        expect(span?.textContent).toBe('>>>>>>>>');
    });

    it('renders with muted color by default', () => {
        const { container } = render(Chevrons);
        const span = container.querySelector('span');
        expect(span?.classList.contains('text-secondary-200')).toBe(true);
    });

    it('renders with accent color when specified', () => {
        const { container } = render(Chevrons, { props: { color: 'accent' } });
        const span = container.querySelector('span');
        expect(span?.classList.contains('text-primary')).toBe(true);
    });

    it('has aria-hidden="true"', () => {
        const { container } = render(Chevrons);
        const span = container.querySelector('span');
        expect(span?.getAttribute('aria-hidden')).toBe('true');
    });

    it('renders exactly count characters', () => {
        const { container } = render(Chevrons, { props: { count: 6 } });
        const span = container.querySelector('span');
        expect(span?.textContent).toBe('>>>>>>');
        expect(span?.textContent?.length).toBe(6);
    });
});
