import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import SocialRow from './SocialRow.svelte';
import { SOCIAL_LINKS } from '$lib/bio';

function links(container: HTMLElement): HTMLAnchorElement[] {
  return Array.from(container.querySelectorAll('a'));
}

describe('SocialRow', () => {
  it('renders one link per social profile', () => {
    const { container } = render(SocialRow);

    expect(links(container)).toHaveLength(SOCIAL_LINKS.length);
  });

  it('gives every link an accessible name, since the mark carries no text', () => {
    const { container } = render(SocialRow);

    links(container).forEach((link, index) => {
      expect(link.getAttribute('aria-label')).toBe(SOCIAL_LINKS[index].name);
    });
  });

  it('draws a mark inside every link', () => {
    const { container } = render(SocialRow);

    links(container).forEach((link, index) => {
      const mark = link.querySelector('img');
      expect(mark).toBeTruthy();
      expect(mark?.getAttribute('src')).toContain(`/${SOCIAL_LINKS[index].logo}.svg`);
      // The anchor names the profile, so the image must stay out of the tree.
      expect(mark?.getAttribute('alt')).toBe('');
    });
  });

  it('renders no visible text, so the row is marks only', () => {
    const { container } = render(SocialRow);

    expect(container.textContent?.trim()).toBe('');
  });

  it('draws every mark at one height, so the row sits on a line', () => {
    const { container } = render(SocialRow);

    links(container).forEach((link) => {
      expect(link.querySelector('img')?.className).toContain('h-5');
    });
  });

  it('opens each profile in a new tab without handing over the opener', () => {
    const { container } = render(SocialRow);

    links(container).forEach((link) => {
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    });
  });
});
