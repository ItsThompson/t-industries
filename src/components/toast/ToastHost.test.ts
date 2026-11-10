import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/svelte';
import { get } from 'svelte/store';
import ToastHost from './ToastHost.svelte';
import { SUMMARY_ORIGIN_TOAST_KIND, clearToasts, showToast, toasts } from '$lib/toasts';

function toastElements(container: HTMLElement): HTMLElement[] {
	return Array.from(container.querySelectorAll<HTMLElement>('[data-toast]'));
}

describe('ToastHost', () => {
	beforeEach(() => {
		clearToasts();
	});

	afterEach(() => {
		cleanup();
		clearToasts();
		vi.restoreAllMocks();
	});

	it('renders the variant registered for the queued kind', () => {
		showToast(SUMMARY_ORIGIN_TOAST_KIND);

		const { container } = render(ToastHost);

		expect(toastElements(container)).toHaveLength(1);
		expect(toastElements(container)[0]?.dataset.toast).toBe(SUMMARY_ORIGIN_TOAST_KIND);
		expect(container.textContent).toContain('RETURN TO SUMMARY');
	});

	it('renders nothing when the queue is empty', () => {
		const { container } = render(ToastHost);

		expect(toastElements(container)).toHaveLength(0);
	});

	it('keeps a live region mounted, so a toast raised later is announced', () => {
		const { container } = render(ToastHost);
		const region = container.querySelector('[aria-live="polite"]');

		expect(region).toBeTruthy();
		expect(region?.textContent).toBe('');
	});

	it('removes the toast from the queue when the variant asks to dismiss', async () => {
		showToast(SUMMARY_ORIGIN_TOAST_KIND);
		const { container } = render(ToastHost);

		await fireEvent.click(
			container.querySelector('[aria-label="Dismiss notice"]') as HTMLElement
		);

		expect(get(toasts)).toEqual([]);
	});

	it('dismisses the newest toast on Escape', async () => {
		showToast(SUMMARY_ORIGIN_TOAST_KIND);
		render(ToastHost);

		await fireEvent.keyDown(window, { key: 'Escape' });

		expect(get(toasts)).toEqual([]);
	});

	it('leaves the toast in place for other keys', async () => {
		showToast(SUMMARY_ORIGIN_TOAST_KIND);
		render(ToastHost);

		await fireEvent.keyDown(window, { key: 'Tab' });

		expect(get(toasts)).toHaveLength(1);
	});

	it('only accepts pointer events on the toast itself, never on the empty slot around it', () => {
		const { container } = render(ToastHost);
		const region = container.firstElementChild as HTMLElement;

		expect(region.className).toContain('pointer-events-none');
	});

	it('floats in the corner on desktop and stays in flow on mobile', () => {
		showToast(SUMMARY_ORIGIN_TOAST_KIND);
		const { container } = render(ToastHost);
		const region = container.firstElementChild as HTMLElement;
		const toast = toastElements(container)[0];

		expect(region.className).toContain('md:fixed');
		expect(region.className).toContain('md:bottom-6');
		expect(toast?.className).toContain('w-full');
		expect(toast?.className).toContain('md:w-80');
	});
});
