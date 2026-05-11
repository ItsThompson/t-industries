import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import Divider from './Divider.svelte';

describe('Divider', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders a line of dash characters without label', () => {
        const { container } = render(Divider);
        const div = container.querySelector('div');
        expect(div?.textContent).toContain('─');
    });

    it('renders inline label when provided', () => {
        const { container } = render(Divider, { props: { label: 'EXPERIENCE' } });
        const div = container.querySelector('div');
        expect(div?.textContent).toContain('EXPERIENCE');
        expect(div?.textContent).toBe('──── EXPERIENCE ────');
    });

    it('has aria-hidden="true"', () => {
        const { container } = render(Divider);
        const div = container.querySelector('div');
        expect(div?.getAttribute('aria-hidden')).toBe('true');
    });

    it('uses text-secondary-200 color', () => {
        const { container } = render(Divider);
        const div = container.querySelector('div');
        expect(div?.classList.contains('text-secondary-200')).toBe(true);
    });
});
