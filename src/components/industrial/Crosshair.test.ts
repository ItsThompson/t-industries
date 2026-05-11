import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import Crosshair from './Crosshair.svelte';

describe('Crosshair', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders a single + character', () => {
        const { container } = render(Crosshair);
        const span = container.querySelector('span');
        expect(span?.textContent).toBe('+');
    });

    it('has aria-hidden="true"', () => {
        const { container } = render(Crosshair);
        const span = container.querySelector('span');
        expect(span?.getAttribute('aria-hidden')).toBe('true');
    });

    it('uses text-secondary-200 color', () => {
        const { container } = render(Crosshair);
        const span = container.querySelector('span');
        expect(span?.classList.contains('text-secondary-200')).toBe(true);
    });
});
