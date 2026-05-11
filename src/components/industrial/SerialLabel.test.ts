import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import SerialLabel from './SerialLabel.svelte';

describe('SerialLabel', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders prefix-number format with zero-padded number', () => {
        const { container } = render(SerialLabel, { props: { prefix: 'TI', number: 510 } });
        const span = container.querySelector('span');
        expect(span?.textContent).toBe('TI-0510');
    });

    it('zero-pads numbers to 4 digits', () => {
        const { container } = render(SerialLabel, { props: { prefix: 'ARC', number: 7 } });
        const span = container.querySelector('span');
        expect(span?.textContent).toBe('ARC-0007');
    });

    it('renders raw text when text prop is provided', () => {
        const { container } = render(SerialLabel, { props: { text: 'STATUS: ACTIVE' } });
        const span = container.querySelector('span');
        expect(span?.textContent).toBe('STATUS: ACTIVE');
    });

    it('uses label-sm class', () => {
        const { container } = render(SerialLabel, { props: { text: 'TEST' } });
        const span = container.querySelector('span');
        expect(span?.classList.contains('label-sm')).toBe(true);
    });

    it('uses text-secondary-200 color', () => {
        const { container } = render(SerialLabel, { props: { prefix: 'TI', number: 1 } });
        const span = container.querySelector('span');
        expect(span?.classList.contains('text-secondary-200')).toBe(true);
    });

    it('does not render number larger than 4 digits truncated', () => {
        const { container } = render(SerialLabel, { props: { prefix: 'X', number: 12345 } });
        const span = container.querySelector('span');
        expect(span?.textContent).toBe('X-12345');
    });
});
