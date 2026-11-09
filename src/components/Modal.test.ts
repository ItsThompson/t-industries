import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/svelte';
import { tick } from 'svelte';
import Modal from './Modal.svelte';

function renderModal(props: Record<string, unknown> = {}) {
	const closes: number[] = [];
	const result = render(Modal, {
		props: {
			titleId: 'modal-title',
			onClose: () => {
				closes.push(1);
			},
			...props
		}
	});
	return { ...result, closed: () => closes.length };
}

function dialogOf(container: HTMLElement): HTMLElement {
	const dialog = container.querySelector('[role="dialog"]');
	if (!dialog) throw new Error('No dialog rendered');
	return dialog as HTMLElement;
}

describe('Modal', () => {
	afterEach(() => {
		cleanup();
	});

	it('opens as a modal dialog named by the given element', () => {
		const { container } = renderModal();

		expect(dialogOf(container).getAttribute('aria-modal')).toBe('true');
		expect(dialogOf(container).getAttribute('aria-labelledby')).toBe('modal-title');
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

	it('closes on a backdrop click, so the panel is easy to dismiss', async () => {
		const { container, closed } = renderModal();

		await fireEvent.click(container.querySelector('[data-modal-backdrop]') as HTMLElement);

		expect(closed()).toBe(1);
	});

	it('moves focus into the panel on open', async () => {
		const { container } = renderModal();
		await tick();

		expect(dialogOf(container).contains(document.activeElement)).toBe(true);
	});

	it('returns focus to the trigger on close', async () => {
		const trigger = document.createElement('button');
		document.body.appendChild(trigger);
		trigger.focus();

		const { unmount } = render(Modal, {
			props: { titleId: 'modal-title', onClose: () => undefined }
		});
		await tick();
		unmount();

		expect(document.activeElement).toBe(trigger);
		trigger.remove();
	});

	it('leaves nothing focused when the trigger was clicked with a pointer', async () => {
		const trigger = document.createElement('button');
		document.body.appendChild(trigger);
		trigger.focus();

		const { unmount } = render(Modal, {
			props: { titleId: 'modal-title', onClose: () => undefined, restoreFocus: false }
		});
		await tick();
		unmount();

		expect(document.activeElement).not.toBe(trigger);
		trigger.remove();
	});

	it('keeps tab focus inside the panel', async () => {
		const { container } = renderModal();
		await tick();

		const closeButton = dialogOf(container).querySelector('button') as HTMLElement;
		closeButton.focus();

		await fireEvent.keyDown(window, { key: 'Tab' });

		expect(document.activeElement).toBe(closeButton);
	});

	it('widens the panel with the given size class', () => {
		const { container } = renderModal({ sizeClass: 'max-w-6xl' });

		expect(dialogOf(container).className).toContain('max-w-6xl');
	});
});
