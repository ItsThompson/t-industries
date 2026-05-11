import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { render, cleanup, screen } from '@testing-library/svelte';
import ManifestPage from './+page.svelte';

// Mock the fetch API
const mockFetch = vi.fn();
(globalThis as unknown as { fetch: typeof fetch }).fetch = mockFetch;

const defaultProps = {
    data: {
        projects: [],
        projectsError: false
    }
};

describe('Manifest Identity Section', () => {
    beforeEach(() => {
        mockFetch.mockReset();
        mockFetch.mockResolvedValue({
            json: () => Promise.resolve(['Distributed Systems', 'WebGL Shaders', 'Rust'])
        });
    });

    afterEach(() => {
        cleanup();
    });

    it('renders section with id="identity"', () => {
        const { container } = render(ManifestPage, { props: defaultProps });
        const section = container.querySelector('#identity');
        expect(section).not.toBeNull();
        expect(section?.tagName).toBe('SECTION');
    });

    it('renders bio compartment with name and title', () => {
        render(ManifestPage, { props: defaultProps });
        expect(screen.getByText('Thompson Tong')).toBeTruthy();
        expect(screen.getByText('Software Engineer + Student')).toBeTruthy();
    });

    it('renders Age component in bio', () => {
        const { container } = render(ManifestPage, { props: defaultProps });
        // Age component renders a number, verify the bio paragraph references it
        const bioText = container.querySelector('#identity')?.textContent;
        expect(bioText).toContain('year old software engineer');
    });

    it('renders status compartment with ACTIVE indicator', () => {
        const { container } = render(ManifestPage, { props: defaultProps });
        const statusText = container.textContent;
        expect(statusText).toContain('● ACTIVE');
    });

    it('renders status with uptime in YRS format', () => {
        const { container } = render(ManifestPage, { props: defaultProps });
        const text = container.textContent || '';
        expect(text).toMatch(/UPTIME:.*YRS/);
    });

    it('renders experience cycles in status', () => {
        const { container } = render(ManifestPage, { props: defaultProps });
        const text = container.textContent || '';
        expect(text).toMatch(/EXP\.CYCLES: \d+/);
    });

    it('renders LOC: LON in status', () => {
        const { container } = render(ManifestPage, { props: defaultProps });
        expect(container.textContent).toContain('LOC: LON');
    });

    it('renders connections compartment with GitHub link', () => {
        render(ManifestPage, { props: defaultProps });
        const githubLink = screen.getByText(/GitHub/);
        expect(githubLink).toBeTruthy();
        expect(githubLink.closest('a')?.getAttribute('href')).toBe('https://github.com/ItsThompson');
    });

    it('renders connections compartment with LinkedIn link', () => {
        render(ManifestPage, { props: defaultProps });
        const linkedinLink = screen.getByText(/LinkedIn/);
        expect(linkedinLink).toBeTruthy();
        expect(linkedinLink.closest('a')?.getAttribute('href')).toBe('https://linkedin.com/in/thompsontong');
    });

    it('renders MetadataBar with unit serial', () => {
        const { container } = render(ManifestPage, { props: defaultProps });
        expect(container.textContent).toContain('TI-0510');
    });

    it('renders MetadataBar with STATUS: ACTIVE', () => {
        const { container } = render(ManifestPage, { props: defaultProps });
        expect(container.textContent).toContain('STATUS: ACTIVE');
    });

    it('renders MetadataBar with system time', () => {
        const { container } = render(ManifestPage, { props: defaultProps });
        const text = container.textContent || '';
        expect(text).toMatch(/SYS\.TIME: \d{2}:\d{2}:\d{2} UTC/);
    });

    it('renders SectionHeading as h2 with IDENTITY text', () => {
        const { container } = render(ManifestPage, { props: defaultProps });
        const h2 = container.querySelector('h2');
        expect(h2).not.toBeNull();
        expect(h2?.textContent).toContain('IDENTITY');
    });

    it('renders SectionHeading with font-display class', () => {
        const { container } = render(ManifestPage, { props: defaultProps });
        const h2 = container.querySelector('h2');
        expect(h2?.classList.contains('font-display')).toBe(true);
    });

    it('renders 12-column grid for desktop layout', () => {
        const { container } = render(ManifestPage, { props: defaultProps });
        const grid = container.querySelector('.grid.grid-cols-12');
        expect(grid).not.toBeNull();
    });

    it('bio compartment spans 6 columns on desktop', () => {
        const { container } = render(ManifestPage, { props: defaultProps });
        const bioCol = container.querySelector('.md\\:col-span-6');
        expect(bioCol).not.toBeNull();
    });

    it('status compartment spans 3 columns on desktop', () => {
        const { container } = render(ManifestPage, { props: defaultProps });
        const statusCols = container.querySelectorAll('.md\\:col-span-3');
        expect(statusCols.length).toBeGreaterThanOrEqual(2);
    });

    it('all compartments default to full width on mobile', () => {
        const { container } = render(ManifestPage, { props: defaultProps });
        const fullCols = container.querySelectorAll('.col-span-12');
        // Bio, Status, Connections, R&D = at least 4
        expect(fullCols.length).toBeGreaterThanOrEqual(4);
    });

    it('shows Loading component while R&D data is fetching', () => {
        mockFetch.mockReturnValue(new Promise(() => {})); // Never resolves
        render(ManifestPage, { props: defaultProps });
        expect(screen.getByText(/Loading/)).toBeTruthy();
    });

    it('renders ACTIVE dot with coral/primary color', () => {
        const { container } = render(ManifestPage, { props: defaultProps });
        const dot = container.querySelector('.text-primary');
        expect(dot?.textContent).toBe('●');
    });

    it('uses metadata values from lib/metadata.ts', () => {
        const { container } = render(ManifestPage, { props: defaultProps });
        const text = container.textContent || '';
        // All these come from metadata.ts
        expect(text).toContain('TI-0510');
        expect(text).toMatch(/UPTIME:.*YRS/);
        expect(text).toMatch(/EXP\.CYCLES:/);
        expect(text).toMatch(/SYS\.TIME:/);
    });

    it('handles R&D fetch error gracefully without crashing', async () => {
        mockFetch.mockRejectedValue(new Error('Network error'));
        const { container } = render(ManifestPage, { props: defaultProps });
        // Should not crash: page still renders
        expect(container.querySelector('#identity')).not.toBeNull();
        // Wait for error state to propagate
        await new Promise((resolve) => setTimeout(resolve, 10));
        expect(container.textContent).toContain('R&D data unavailable');
    });
});
