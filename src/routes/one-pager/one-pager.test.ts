import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import OnePager from './+page.svelte';
import { resetPageRoute, setPageRoute } from '$lib/__mocks__/app-stores';
import { ACCENTS } from '$lib/accents';
import { BIO_NAME } from '$lib/bio';
import { ETHOS_ITEMS } from '$lib/ethos';
import { highlights } from '$lib/experiences';
import { PAPER_GRAIN_OPACITY, hexToRgbTriplet, paperBandColor } from '$lib/paper';
import { THEME_COLORS } from '$lib/theme';

function renderPage(): ReturnType<typeof render> {
  setPageRoute('/one-pager');
  return render(OnePager);
}

function workHeadings(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll('article h3')).map(
    (heading) => heading.textContent ?? '',
  );
}

function ethosLinks(container: HTMLElement): HTMLAnchorElement[] {
  const ethosSection = Array.from(container.querySelectorAll('section')).find((section) =>
    section.textContent?.includes('Ethos'),
  );

  return Array.from(ethosSection?.querySelectorAll('a[href*="?highlight="]') ?? []);
}

describe('one-pager', () => {
  beforeEach(() => {
    setPageRoute('/one-pager');
  });

  afterEach(() => {
    cleanup();
    resetPageRoute();
    vi.restoreAllMocks();
  });

  it('gives the page one h1 that names the person', () => {
    const { container } = renderPage();
    const headings = Array.from(container.querySelectorAll('h1'));

    expect(headings).toHaveLength(1);
    expect(headings[0].textContent).toContain(BIO_NAME);
  });

  it('greets the reader once, so the page does not say hello twice', () => {
    const { container } = renderPage();
    const text = container.textContent ?? '';

    expect(text.match(/Hi, my name is/g)).toHaveLength(1);
    expect(text).not.toContain("Hi, I'm");
  });

  it('lists the three work highlights in timeline order', () => {
    const { container } = renderPage();

    expect(workHeadings(container)).toEqual(
      highlights().map((experience) => experience.company),
    );
    expect(workHeadings(container)).toHaveLength(3);
  });

  it('anchors every work entry, so the bio can jump to it', () => {
    const { container } = renderPage();

    highlights().forEach((experience) => {
      expect(container.querySelector(`#experience-${experience.id}`)).toBeTruthy();
    });
  });

  it('links every work entry to the experience page for the rest', () => {
    const { container } = renderPage();
    const viewAll = Array.from(container.querySelectorAll('a')).find((link) =>
      link.textContent?.includes('View all experience'),
    );

    expect(viewAll?.getAttribute('href')).toBe('/experience?from=summary');
  });

  it('marks every link that leaves the summary, so each one offers the way back', () => {
    const { container } = renderPage();
    const leaving = Array.from(container.querySelectorAll('a')).filter((link) =>
      link.getAttribute('href')?.startsWith('/'),
    );

    expect(leaving).toHaveLength(6);
    leaving.forEach((link) => expect(link.getAttribute('href')).toContain('from=summary'));
  });

  it('leaves the on-page anchors unmarked, since the reader never leaves', () => {
    const { container } = renderPage();
    const anchors = Array.from(container.querySelectorAll('a[href^="#"]'));

    expect(anchors.length).toBeGreaterThan(0);
    anchors.forEach((anchor) => expect(anchor.getAttribute('href')).not.toContain('from='));
  });

  it('links each ethos title to its row on the ethos page', () => {
    const { container } = renderPage();
    const links = ethosLinks(container);

    expect(links).toHaveLength(ETHOS_ITEMS.length);
    ETHOS_ITEMS.forEach((item) => {
      expect(
        links.some(
          (link) => link.getAttribute('href') === `/ethos?highlight=${item.id}&from=summary`,
        ),
      ).toBe(true);
    });
  });

  it('paints every ethos link as a band, matching the other paper highlights', () => {
    const { container } = renderPage();

    ethosLinks(container).forEach((link) => {
      expect(link.className).toContain('rgba(var(--band),var(--band-alpha))');
      expect(link.className).toContain('[box-decoration-break:clone]');
      expect(link.className).toContain('focus-visible:outline-paper-ink');
      expect(link.style.getPropertyValue('--band')).toBe(
        hexToRgbTriplet(paperBandColor(ACCENTS.primary)),
      );
    });
  });

  it('reveals no note from an ethos link, so the browser owns the whole interaction', () => {
    const { container } = renderPage();

    ethosLinks(container).forEach((link) => {
      expect(link.hasAttribute('aria-describedby')).toBe(false);
      expect(link.querySelector('[role="tooltip"]')).toBeNull();
    });
  });

  it('reads the ethos titles as one sentence', () => {
    const { container } = renderPage();
    const titles = ETHOS_ITEMS.map((item) => item.title.toLowerCase());
    const sentence = Array.from(container.querySelectorAll('p')).find((paragraph) =>
      paragraph.textContent?.includes(titles[0]),
    );

    expect(sentence?.textContent?.replace(/\s+/g, ' ').trim()).toContain(
      `${titles[0]}, ${titles[1]}, and ${titles[2]}.`,
    );
  });

  it('renders two named social links, so the row is usable without the marks', () => {
    const { container } = renderPage();
    const socials = Array.from(container.querySelectorAll('a[target="_blank"]'));

    expect(socials).toHaveLength(2);
    socials.forEach((link) => expect(link.getAttribute('aria-label')).toBeTruthy());
  });

  it('renders no site chrome, which is the point of the page', () => {
    const { container } = renderPage();

    expect(container.querySelector('footer')).toBeNull();
    expect(container.querySelector('nav')).toBeNull();
    expect(container.querySelector('canvas')).toBeNull();
  });

  it('paints the page on paper', () => {
    const { container } = renderPage();
    const wrapper = container.firstElementChild;

    expect(wrapper?.className).toContain('bg-paper-base');
    expect(wrapper?.className).toContain('text-paper-ink');
    expect(wrapper?.className).toContain('font-outfit');
  });

  it('lays a grain over the paper at a strength that shows', () => {
    const { container } = renderPage();
    const grain = container.querySelector('[aria-hidden="true"]') as HTMLElement;

    expect(grain.style.backgroundImage).toContain('/grain.svg');
    expect(Number(grain.style.opacity)).toBe(PAPER_GRAIN_OPACITY);
    expect(grain.className).toContain('mix-blend-multiply');
  });

  it('paints the body before hydration, so overscroll never shows the black site', () => {
    renderPage();

    const style = document.head.querySelector('style')?.textContent ?? '';
    expect(style).toContain(THEME_COLORS.paper.base);
  });

  it('loads the Outfit family on this route only', () => {
    renderPage();

    const hrefs = Array.from(document.head.querySelectorAll('link')).map((link) =>
      link.getAttribute('href'),
    );

    expect(hrefs.some((href) => href?.includes('family=Outfit'))).toBe(true);
  });

  it('canonicalises to the one-pager rather than the home page', () => {
    renderPage();

    expect(
      document.head.querySelector('link[rel="canonical"]')?.getAttribute('href'),
    ).toBe('https://thompsontong.com/one-pager');
  });
});
