import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import MetadataBar from './MetadataBar.svelte';

describe('MetadataBar', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders a flex container', () => {
        const { container } = render(MetadataBar);
        const div = container.querySelector('div');
        expect(div?.classList.contains('flex')).toBe(true);
        expect(div?.classList.contains('justify-between')).toBe(true);
    });

    it('applies label-sm class for typography', () => {
        const { container } = render(MetadataBar);
        const div = container.querySelector('div');
        expect(div?.classList.contains('label-sm')).toBe(true);
    });

    it('applies uppercase styling', () => {
        const { container } = render(MetadataBar);
        const div = container.querySelector('div');
        expect(div?.classList.contains('uppercase')).toBe(true);
    });

    it('applies text-secondary-200 color', () => {
        const { container } = render(MetadataBar);
        const div = container.querySelector('div');
        expect(div?.classList.contains('text-secondary-200')).toBe(true);
    });

    it('applies bottom border when position is top', () => {
        const { container } = render(MetadataBar, { props: { position: 'top' } });
        const div = container.querySelector('div');
        expect(div?.classList.contains('border-b')).toBe(true);
    });

    it('applies top border when position is bottom', () => {
        const { container } = render(MetadataBar, { props: { position: 'bottom' } });
        const div = container.querySelector('div');
        expect(div?.classList.contains('border-t')).toBe(true);
    });
});
