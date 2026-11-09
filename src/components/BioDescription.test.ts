import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/svelte';
import { tick } from 'svelte';
import BioDescription from './BioDescription.svelte';
import { ACCENTS } from '$lib/accents';

function findLink(container: HTMLElement, text: string): HTMLAnchorElement {
	const link = Array.from(container.querySelectorAll('a')).find((candidate) =>
		candidate.textContent?.includes(text)
	);
	if (!link) throw new Error(`No link containing "${text}"`);
	return link as HTMLAnchorElement;
}

function tooltipFor(link: HTMLElement): HTMLElement {
	const id = link.getAttribute('aria-describedby');
	const tooltip = id ? document.getElementById(id) : null;
	if (!tooltip) throw new Error('Link has no tooltip');
	return tooltip;
}

function proseWithoutNotes(container: HTMLElement): string {
	const clone = container.cloneNode(true) as HTMLElement;
	clone.querySelectorAll('[role="tooltip"]').forEach((note) => note.remove());
	return (clone.textContent ?? '').replace(/\s+/g, ' ');
}

describe('BioDescription', () => {
	beforeEach(() => {
		// jsdom reports zero-sized boxes, which the note positioning must survive.
		Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true });
	});

	afterEach(() => {
		cleanup();
	});

	it('keeps the bio prose intact', () => {
		const { container } = render(BioDescription);
		const text = container.textContent ?? '';
		expect(text).toContain('software engineer');
		expect(text).toContain('years of experience');
		expect(text).toContain('8 different cities across 3 continents');
		expect(text).toContain('University of Bath');
	});

	it('leaves no gap between a link and the punctuation after it', () => {
		const { container } = render(BioDescription);
		const prose = proseWithoutNotes(container);

		expect(prose).toContain('3 continents, which');
		expect(prose).toContain('placement at Amazon, and');
		expect(prose).toContain('first principles, whether');
		expect(prose).not.toMatch(/ [,.;:]/);
	});

	it('links each named role to the experience entry that proves it', () => {
		const { container } = render(BioDescription);

		expect(findLink(container, 'placement at Amazon').getAttribute('href')).toBe(
			'/experience?highlight=amazon'
		);
		expect(findLink(container, 'LLMOps at MSD').getAttribute('href')).toBe(
			'/experience?highlight=msd'
		);
		expect(findLink(container, 'programming research assistant for CRIISP').getAttribute('href')).toBe(
			'/experience?highlight=criisp'
		);
	});

	it('links first-principles curiosity to the continuous learning row', () => {
		const { container } = render(BioDescription);

		expect(findLink(container, 'systems work from first principles').getAttribute('href')).toBe(
			'/ethos?highlight=continuous-learning'
		);
	});

	it('renders exactly the four interactive links', () => {
		const { container } = render(BioDescription);
		expect(container.querySelectorAll('a')).toHaveLength(4);
	});

	it('colors each link with its organization accent', () => {
		const { container } = render(BioDescription);

		expect(findLink(container, 'placement at Amazon').style.color).toBe(
			'rgb(255, 153, 0)'
		);
		expect(findLink(container, 'LLMOps at MSD').style.color).toBe('rgb(0, 148, 132)');
		expect(findLink(container, 'programming research assistant for CRIISP').style.color).toBe(
			'rgb(171, 219, 250)'
		);
		expect(findLink(container, 'systems work from first principles').style.color).toBe(
			'rgb(255, 99, 99)'
		);
	});

	it('describes every link with a tooltip that exists in the document', () => {
		const { container } = render(BioDescription);

		for (const link of Array.from(container.querySelectorAll('a'))) {
			const tooltip = tooltipFor(link as HTMLAnchorElement);
			expect(tooltip.getAttribute('role')).toBe('tooltip');
		}
	});

	it('keeps the notes hidden until the reader asks for them', () => {
		const { container } = render(BioDescription);

		for (const link of Array.from(container.querySelectorAll('a'))) {
			expect(tooltipFor(link as HTMLAnchorElement).className).toContain('invisible');
		}
	});

	it('reveals the note on hover', async () => {
		const { container } = render(BioDescription);
		const link = findLink(container, 'LLMOps at MSD');

		await fireEvent.mouseEnter(link);
		await tick();

		expect(tooltipFor(link).className).toContain('visible');
		expect(tooltipFor(link).textContent).toContain('RAG pipeline');
	});

	it('hides the note when the pointer leaves', async () => {
		const { container } = render(BioDescription);
		const link = findLink(container, 'LLMOps at MSD');

		await fireEvent.mouseEnter(link);
		await tick();
		await fireEvent.mouseLeave(link);
		await tick();

		expect(tooltipFor(link).className).toContain('invisible');
	});

	it('reveals the note on keyboard focus', async () => {
		const { container } = render(BioDescription);
		const link = findLink(container, 'placement at Amazon');

		await fireEvent.focus(link);
		await tick();

		expect(tooltipFor(link).className).toContain('visible');
	});

	it('hides the note on blur', async () => {
		const { container } = render(BioDescription);
		const link = findLink(container, 'placement at Amazon');

		await fireEvent.focus(link);
		await tick();
		await fireEvent.blur(link);
		await tick();

		expect(tooltipFor(link).className).toContain('invisible');
	});

	it('closes the note on Escape without leaving the page', async () => {
		const { container } = render(BioDescription);
		const link = findLink(container, 'systems work from first principles');

		await fireEvent.focus(link);
		await tick();
		await fireEvent.keyDown(link, { key: 'Escape' });
		await tick();

		expect(tooltipFor(link).className).toContain('invisible');
	});

	it('states that the link opens the target, so the affordance is obvious', async () => {
		const { container } = render(BioDescription);
		const link = findLink(container, 'programming research assistant for CRIISP');

		await fireEvent.mouseEnter(link);
		await tick();

		expect(tooltipFor(link).textContent).toContain('CLICK TO OPEN');
	});

	it('keeps the note open when focusing scrolls the page', async () => {
		const { container } = render(BioDescription);
		const link = findLink(container, 'placement at Amazon');

		await fireEvent.focus(link);
		await tick();
		await fireEvent.scroll(window);
		await tick();

		expect(tooltipFor(link).className).toContain('visible');
	});

	it('closes the note once its link scrolls out of view', async () => {
		const { container } = render(BioDescription);
		const link = findLink(container, 'placement at Amazon');
		link.getBoundingClientRect = () =>
			({ top: window.innerHeight + 100, bottom: window.innerHeight + 120, left: 0, width: 0, height: 0 }) as DOMRect;

		await fireEvent.focus(link);
		await tick();
		await fireEvent.scroll(window);
		await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
		await tick();

		expect(tooltipFor(link).className).toContain('invisible');
	});

	it('uses the ethos accent for the first-principles note', () => {
		expect(ACCENTS.ethos).toBe('#FF6363');
	});

	describe('first website easter egg', () => {
		function findExperienceTrigger(container: HTMLElement): HTMLElement {
			const element = Array.from(container.querySelectorAll('[role="button"]')).find(
				(candidate) => candidate.textContent?.includes('years of experience')
			);
			if (!element) throw new Error('No experience trigger');
			return element as HTMLElement;
		}

		it('renders the experience phrase as a button, not a link to the old site', () => {
			const { container } = render(BioDescription);
			const trigger = findExperienceTrigger(container);

			expect(trigger.getAttribute('role')).toBe('button');
			expect(trigger.hasAttribute('href')).toBe(false);
		});

		it('keeps the phrase in the text flow, so it wraps with the sentence', () => {
			const { container } = render(BioDescription);
			const trigger = findExperienceTrigger(container);

			// A button would be laid out inline-block and could not wrap mid-phrase.
			expect(trigger.tagName).toBe('SPAN');
			expect(container.querySelector('button')).toBeNull();
		});

		it('shows nothing of the old site until the phrase is hovered', () => {
			const { container } = render(BioDescription);
			const note = tooltipFor(findExperienceTrigger(container));

			expect(note.querySelector('img')).toBeNull();
		});

		it('reveals a screenshot of the old site on hover', async () => {
			const { container } = render(BioDescription);
			const trigger = findExperienceTrigger(container);

			await fireEvent.mouseEnter(trigger);
			await tick();

			const image = tooltipFor(trigger).querySelector('img');
			if (!image) throw new Error('No screenshot rendered');

			expect(image.getAttribute('src')).toBe('/old-site.png');
			expect(image.getAttribute('alt')).toContain('first site');
		});

		it('names the note, so the picture has a caption', async () => {
			const { container } = render(BioDescription);
			const trigger = findExperienceTrigger(container);

			await fireEvent.mouseEnter(trigger);
			await tick();

			expect(tooltipFor(trigger).textContent).toContain('Old Site');
		});

		it('says the note opens the screenshot', async () => {
			const { container } = render(BioDescription);
			const trigger = findExperienceTrigger(container);

			await fireEvent.mouseEnter(trigger);
			await tick();

			expect(tooltipFor(trigger).textContent).toContain('CLICK TO OPEN');
		});

		it('keeps the live site closed until the phrase is clicked', () => {
			const { container } = render(BioDescription);

			expect(container.querySelector('[role="dialog"]')).toBeNull();
		});

		it('opens the live copy of the site in a frame when the phrase is clicked', async () => {
			const { container } = render(BioDescription);

			await fireEvent.click(findExperienceTrigger(container));
			await tick();

			const dialog = container.querySelector('[role="dialog"]');
			if (!dialog) throw new Error('No old site dialog');

			const frame = dialog.querySelector('iframe');
			if (!frame) throw new Error('No frame in the dialog');

			expect(frame.getAttribute('src')).toBe('https://itsthompson.github.io/personal-website/');
			expect(dialog.textContent).toContain('THE FIRST WEBSITE');
		});

		it('closes the old site on Escape', async () => {
			const { container } = render(BioDescription);

			await fireEvent.click(findExperienceTrigger(container));
			await tick();
			await fireEvent.keyDown(window, { key: 'Escape' });
			await tick();

			expect(container.querySelector('[role="dialog"]')).toBeNull();
		});
	});

	describe('places map', () => {
		function findPlacesTrigger(container: HTMLElement): HTMLElement {
			const element = Array.from(container.querySelectorAll('[role="button"]')).find(
				(candidate) => candidate.textContent?.includes('8 different cities')
			);
			if (!element) throw new Error('No places trigger');
			return element as HTMLElement;
		}

		it('renders the places phrase as a button, not a link', () => {
			const { container } = render(BioDescription);
			const trigger = findPlacesTrigger(container);

			expect(trigger.getAttribute('role')).toBe('button');
			expect(trigger.getAttribute('tabindex')).toBe('0');
		});

		it('keeps the map closed until the phrase is activated', () => {
			const { container } = render(BioDescription);

			expect(container.querySelector('[role="dialog"]')).toBeNull();
		});

		it('opens the map when the phrase is clicked', async () => {
			const { container } = render(BioDescription);

			await fireEvent.click(findPlacesTrigger(container));
			await tick();

			expect(container.querySelector('[role="dialog"]')).toBeTruthy();
		});

		it('closes the map on Escape', async () => {
			const { container } = render(BioDescription);

			await fireEvent.click(findPlacesTrigger(container));
			await tick();
			await fireEvent.keyDown(window, { key: 'Escape' });
			await tick();

			expect(container.querySelector('[role="dialog"]')).toBeNull();
		});

		it('leaves the trigger unselected after a pointer click closes the map', async () => {
			const { container } = render(BioDescription);
			const trigger = findPlacesTrigger(container);
			trigger.focus();

			await fireEvent.click(trigger, { detail: 1 });
			await tick();
			await fireEvent.keyDown(window, { key: 'Escape' });
			await tick();

			expect(document.activeElement).not.toBe(trigger);
			expect(tooltipFor(trigger).className).toContain('invisible');
		});

		it('returns focus to the trigger after a keyboard open and close', async () => {
			const { container } = render(BioDescription);
			const trigger = findPlacesTrigger(container);
			trigger.focus();

			await fireEvent.keyDown(trigger, { key: 'Enter' });
			await tick();
			await fireEvent.keyDown(window, { key: 'Escape' });
			await tick();

			expect(document.activeElement).toBe(trigger);
		});

		it('tells the reader the phrase opens a map', async () => {
			const { container } = render(BioDescription);
			const trigger = findPlacesTrigger(container);

			await fireEvent.mouseEnter(trigger);
			await tick();

			expect(tooltipFor(trigger).textContent).toContain('CLICK TO OPEN MAP');
		});
	});
});
