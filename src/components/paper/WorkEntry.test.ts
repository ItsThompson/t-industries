import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import WorkEntry from './WorkEntry.svelte';
import { highlights } from '$lib/experiences';
import { hexToRgbTriplet } from '$lib/paper';

const EXPERIENCE = highlights()[0];

describe('WorkEntry', () => {
  it('names the company in the entry heading', () => {
    const { container } = render(WorkEntry, { props: { experience: EXPERIENCE } });
    const heading = container.querySelector('h3');

    expect(heading?.textContent).toBe(EXPERIENCE.company);
  });

  it('reads the role and the dates on one line', () => {
    const { container } = render(WorkEntry, { props: { experience: EXPERIENCE } });

    expect(container.textContent).toContain(EXPERIENCE.role);
    expect(container.textContent).toContain(
      `${EXPERIENCE.startDate} to ${EXPERIENCE.endDate}`,
    );
  });

  it('renders the summary line the one-pager promises', () => {
    const { container } = render(WorkEntry, { props: { experience: EXPERIENCE } });

    expect(container.textContent).toContain(EXPERIENCE.highlightSummary);
  });

  it('carries the shared anchor id, so the bio can jump to it', () => {
    const { container } = render(WorkEntry, { props: { experience: EXPERIENCE } });

    expect(container.querySelector('article')?.id).toBe(
      `experience-${EXPERIENCE.id}`,
    );
  });

  it('leaves room above the entry, so a hash jump does not hide the heading', () => {
    const { container } = render(WorkEntry, { props: { experience: EXPERIENCE } });

    expect(container.querySelector('article')?.className).toContain('scroll-mt-24');
  });

  it('carries its own accent, so the landing marker matches the entry', () => {
    const { container } = render(WorkEntry, { props: { experience: EXPERIENCE } });
    const article = container.querySelector('article') as HTMLElement;

    expect(article.style.getPropertyValue('--band')).toBe(
      hexToRgbTriplet(EXPERIENCE.accent),
    );
  });

  it('keeps the ink colors from the page rather than a fixed color', () => {
    const { container } = render(WorkEntry, { props: { experience: EXPERIENCE } });

    expect(container.querySelector('.text-paper-muted')).toBeTruthy();
    expect(container.innerHTML).not.toContain('text-white');
  });
});
