import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/svelte';
import CanvasPage from './+page.svelte';
import { resetPageRoute, setPageRoute } from '$lib/__mocks__/app-stores';
import { ACCENTS } from '$lib/accents';
import { BIO_NAME } from '$lib/bio';
import { ETHOS_ITEMS } from '$lib/ethos';
import { highlights } from '$lib/experiences';
import type { PinnedProject } from '$lib/github';
import { hexToRgbTriplet, canvasBandColor } from '$lib/canvas';

function renderPage(projects: PinnedProject[] = []): ReturnType<typeof render> {
  setPageRoute('/(canvas)');
  return render(CanvasPage, { props: { data: { projects } } });
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

describe('canvas', () => {
  beforeEach(() => {
    setPageRoute('/(canvas)');
  });

  afterEach(() => {
    cleanup();
    window.location.hash = '';
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

  it('narrows the column, so the gutter can hold the arrow', () => {
    const { container } = renderPage();
    const column = container.querySelector('.max-w-3xl');

    expect(column?.className).toContain('max-w-3xl');
    expect(column?.className).not.toContain('max-w-6xl');
  });

  it('marks the entry when the arrow cannot draw, keeping the fallback line', async () => {
    // jsdom reports zero rects, so the arrow can never draw and the page falls
    // back to the jump and the accent line.
    const { container } = renderPage();
    const phrase = Array.from(container.querySelectorAll('a')).find((link) =>
      link.getAttribute('href') === '#experience-msd',
    );
    if (!phrase) throw new Error('No work phrase rendered');

    await fireEvent.click(phrase);

    const msd = container.querySelector('#experience-msd');
    expect(msd?.className).toContain('marked');
    expect(container.querySelector('#experience-amazon')?.className).not.toContain('marked');
  });

  it('marks the deep-linked entry on mount, now that the marker is state', () => {
    window.location.hash = '#experience-amazon';

    const { container } = renderPage();

    expect(container.querySelector('#experience-amazon')?.className).toContain('marked');
    expect(container.querySelector('#experience-msd')?.className).not.toContain('marked');
  });

  it('links every work entry to the experience page for the rest', () => {
    const { container } = renderPage();
    const viewAll = Array.from(container.querySelectorAll('a')).find((link) =>
      link.textContent?.includes('View all experience'),
    );

    expect(viewAll?.getAttribute('href')).toBe('/terminal/experience?from=canvas');
  });

  it('marks every link that leaves the canvas, so each one offers the way back', () => {
    const { container } = renderPage();
    const leaving = Array.from(container.querySelectorAll('a')).filter((link) =>
      link.getAttribute('href')?.startsWith('/'),
    );

    expect(leaving).toHaveLength(6);
    leaving.forEach((link) => expect(link.getAttribute('href')).toContain('from=canvas'));
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
          (link) => link.getAttribute('href') === `/terminal/ethos?highlight=${item.id}&from=canvas`,
        ),
      ).toBe(true);
    });
  });

  it('paints every ethos link as a band, matching the other canvas highlights', () => {
    const { container } = renderPage();

    ethosLinks(container).forEach((link) => {
      expect(link.className).toContain('rgba(var(--band),var(--band-alpha))');
      expect(link.className).toContain('[box-decoration-break:clone]');
      expect(link.className).toContain('focus-visible:outline-canvas-ink');
      expect(link.style.getPropertyValue('--band')).toBe(
        hexToRgbTriplet(canvasBandColor(ACCENTS.primary)),
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
    const socials = Array.from(container.querySelectorAll('a[aria-label]'));

    expect(socials).toHaveLength(2);
    socials.forEach((link) => expect(link.getAttribute('aria-label')).toBeTruthy());
  });

  it('renders no site chrome, which is the point of the page', () => {
    const { container } = renderPage();

    expect(container.querySelector('footer')).toBeNull();
    expect(container.querySelector('nav')).toBeNull();
    expect(container.querySelector('canvas')).toBeNull();
  });

  it('leaves the backdrop to the layout, so the ripples can sit under the text', () => {
    const { container } = renderPage();
    const wrapper = container.firstElementChild;

    expect(wrapper?.className).toContain('text-canvas-ink');
    expect(wrapper?.className).toContain('font-outfit');
    expect(wrapper?.className).not.toContain('bg-canvas-base');
  });

  it('lays no grain of its own, since the layout owns the canvas backdrop', () => {
    const { container } = renderPage();

    expect(container.querySelector('.mix-blend-multiply')).toBeNull();
  });

  it('canonicalises to the site root, which is where the canvas lives', () => {
    renderPage();

    expect(
      document.head.querySelector('link[rel="canonical"]')?.getAttribute('href'),
    ).toBe('https://thompsontong.com/');
  });
});

const PROJECTS: PinnedProject[] = [
  {
    name: 'pipes',
    description: '',
    githubUrl: 'https://github.com/ItsThompson/pipes',
    homepageUrl: 'https://pipes.dev',
    primaryLanguage: null,
  },
  {
    name: 'ledger',
    description: '',
    githubUrl: 'https://github.com/ItsThompson/ledger',
    homepageUrl: '',
    primaryLanguage: null,
  },
  {
    name: 'atlas',
    description: '',
    githubUrl: 'https://github.com/ItsThompson/atlas',
    homepageUrl: 'https://atlas.dev',
    primaryLanguage: null,
  },
];

function projectSentence(container: HTMLElement): HTMLParagraphElement | undefined {
  return Array.from(container.querySelectorAll('p')).find((paragraph) =>
    paragraph.textContent?.includes('I built'),
  );
}

function projectLinks(container: HTMLElement): HTMLAnchorElement[] {
  return Array.from(projectSentence(container)?.querySelectorAll('a') ?? []);
}

function spokenText(element: HTMLElement | undefined): string {
  if (!element) return '';

  const copy = element.cloneNode(true) as HTMLElement;
  copy.querySelectorAll('[aria-hidden="true"]').forEach((decorative) => decorative.remove());

  return (copy.textContent ?? '').replace(/\s+/g, ' ').trim();
}

describe('canvas projects line', () => {
  beforeEach(() => {
    setPageRoute('/(canvas)');
  });

  afterEach(() => {
    cleanup();
    resetPageRoute();
    vi.restoreAllMocks();
  });

  it('reads the pinned projects as one sentence, in the pinned order', () => {
    const { container } = renderPage(PROJECTS);

    expect(spokenText(projectSentence(container))).toBe('I built pipes, ledger, and atlas.');
  });

  it('stands the sentence after the bio, so the page introduces the person first', () => {
    const { container } = renderPage(PROJECTS);
    const paragraphs = Array.from(container.querySelectorAll('p'));
    const bioIndex = paragraphs.findIndex((paragraph) =>
      paragraph.textContent?.includes("I'm a"),
    );
    const sentence = projectSentence(container);
    if (!sentence) throw new Error('No project sentence rendered');

    expect(paragraphs.indexOf(sentence)).toBeGreaterThan(bioIndex);
  });

  it('links each project to its homepage, or to its repository when it has none', () => {
    const { container } = renderPage(PROJECTS);

    expect(projectLinks(container).map((link) => link.getAttribute('href'))).toEqual([
      'https://pipes.dev',
      'https://github.com/ItsThompson/ledger',
      'https://atlas.dev',
    ]);
  });

  it('opens each project in a new tab, leaving the canvas in place', () => {
    const { container } = renderPage(PROJECTS);

    projectLinks(container).forEach((link) => {
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toContain('noopener');
    });
  });

  it('underlines each project with an arrow, so it reads as leaving the site', () => {
    const { container } = renderPage(PROJECTS);

    projectLinks(container).forEach((link) => {
      expect(link.className).toContain('underline');
      expect(link.className).not.toContain('rgba(var(--band)');
      expect(link.querySelector('[aria-hidden="true"]')?.textContent).toBe('↗');
    });
  });

  it('drops the sentence when nothing is pinned, so the page never reads "I built ."', () => {
    const { container } = renderPage();

    expect(projectSentence(container)).toBeUndefined();
  });
});
