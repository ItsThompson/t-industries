import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import BandLink from './BandLink.svelte';

function renderLink() {
  return render(BandLink, {
    props: { href: '/ethos?highlight=global-perspective', accent: '#FF6363' },
  });
}

function anchor(container: HTMLElement): HTMLAnchorElement {
  const element = container.querySelector('a');
  if (!element) throw new Error('No link rendered');
  return element as HTMLAnchorElement;
}

describe('BandLink', () => {
  it('renders the destination the caller names', () => {
    const { container } = renderLink();

    expect(anchor(container).getAttribute('href')).toBe(
      '/ethos?highlight=global-perspective',
    );
  });

  it('paints the band the page shares with every other highlight', () => {
    const element = anchor(renderLink().container);

    expect(element.className).toContain('rgba(var(--band),var(--band-alpha))');
    expect(element.className).toContain('[box-decoration-break:clone]');
  });

  it('takes the band color from the accent', () => {
    const element = anchor(renderLink().container);

    expect(element.style.getPropertyValue('--band')).toBe('255,99,99');
  });

  it('reveals no note, so the browser owns the whole interaction', async () => {
    const { container } = renderLink();

    expect(container.querySelector('[role="tooltip"]')).toBeNull();
    expect(anchor(container).hasAttribute('aria-describedby')).toBe(false);
  });

  it('outlines focus in ink, which stays visible on paper', () => {
    expect(anchor(renderLink().container).className).toContain(
      'focus-visible:outline-paper-ink',
    );
  });
});
