import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/svelte';
import { tick } from 'svelte';
import OldSiteModal from './OldSiteModal.svelte';
import type { OldSiteSpec } from '$lib/bio-links';

const ACTION: OldSiteSpec = {
	target: 'old-site',
	label: 'Old Site / First Build',
	accent: '#FF6363',
	url: 'https://itsthompson.github.io/personal-website/',
	heading: 'THE FIRST WEBSITE',
	screenshot: {
		src: '/old-site.png',
		alt: 'Screenshot of the first website',
		width: 2048,
		height: 1610
	}
};

function renderModal(): { container: HTMLElement; closed: () => number } {
	let closes = 0;
	const { container } = render(OldSiteModal, {
		props: {
			action: ACTION,
			onClose: () => {
				closes += 1;
			}
		}
	});
	return { container, closed: () => closes };
}

function frameOf(container: HTMLElement): HTMLIFrameElement {
	const frame = container.querySelector('iframe');
	if (!frame) throw new Error('No frame rendered');
	return frame;
}

describe('OldSiteModal', () => {
	afterEach(() => {
		cleanup();
	});

	it('opens as a modal dialog named after the site', () => {
		const { container } = renderModal();
		const dialog = container.querySelector('[role="dialog"]');

		expect(dialog).toBeTruthy();
		expect(dialog?.getAttribute('aria-modal')).toBe('true');
		expect(container.querySelector('#old-site-title')?.textContent).toBe('THE FIRST WEBSITE');
	});

	it('captions the modal with the label from the note', () => {
		const { container } = renderModal();
		expect(container.textContent).toContain('OLD SITE / FIRST BUILD');
	});

	it('frames the live copy of the site', () => {
		const { container } = renderModal();
		const frame = frameOf(container);

		expect(frame.getAttribute('src')).toBe('https://itsthompson.github.io/personal-website/');
		expect(frame.getAttribute('title')).toBe('THE FIRST WEBSITE');
	});

	it('runs the framed site in a sandbox, without letting it navigate the page', () => {
		const { container } = renderModal();
		const sandbox = frameOf(container).getAttribute('sandbox') ?? '';

		expect(sandbox).toContain('allow-scripts');
		expect(sandbox).not.toContain('allow-top-navigation');
	});

	it('gives the frame a viewport-relative height, so it does not grow the dialog', () => {
		const { container } = renderModal();
		expect(frameOf(container).className).toContain('h-[70dvh]');
	});

	it('colors the warning to read as a warning', () => {
		const { container } = renderModal();
		const warning = container.querySelector('[role="note"]') as HTMLElement;

		expect(warning.className).toContain('text-yellow-300');
		expect(warning.className).not.toContain('border');
	});

	it('puts the warning above the frame, where it is read first', () => {
		const { container } = renderModal();
		const warning = container.querySelector('[role="note"]') as HTMLElement;
		const frame = frameOf(container);

		expect(
			warning.compareDocumentPosition(frame) & Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
	});

	it('closes on the close button', async () => {
		const { container, closed } = renderModal();

		await fireEvent.click(container.querySelector('button') as HTMLElement);

		expect(closed()).toBe(1);
	});

	it('closes on Escape', async () => {
		const { closed } = renderModal();

		await fireEvent.keyDown(window, { key: 'Escape' });

		expect(closed()).toBe(1);
	});

	it('returns focus to the trigger on close', async () => {
		const trigger = document.createElement('button');
		document.body.appendChild(trigger);
		trigger.focus();

		const { unmount } = render(OldSiteModal, {
			props: { action: ACTION, onClose: () => undefined }
		});
		await tick();
		unmount();

		expect(document.activeElement).toBe(trigger);
		trigger.remove();
	});
});
