import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/svelte';
import { tick } from 'svelte';
import CityMapModal from './CityMapModal.svelte';
import { CITIES } from '$lib/cities';

function renderModal(): { container: HTMLElement; closed: () => number } {
	let closes = 0;
	const { container } = render(CityMapModal, {
		props: {
			onClose: () => {
				closes += 1;
			}
		}
	});
	return { container, closed: () => closes };
}

describe('CityMapModal', () => {
	afterEach(() => {
		cleanup();
	});

	it('opens as a modal dialog named after the places', () => {
		const { container } = renderModal();
		const dialog = container.querySelector('[role="dialog"]');

		expect(dialog).toBeTruthy();
		expect(dialog?.getAttribute('aria-modal')).toBe('true');
		expect(dialog?.getAttribute('aria-labelledby')).toBe('places-title');
		expect(container.querySelector('#places-title')?.textContent).toContain('PLACES LIVED');
	});

	it('states the counts from the bio copy', () => {
		const { container } = renderModal();

		expect(container.textContent).toContain('8 CITIES');
		expect(container.textContent).toContain('3 CONTINENTS');
	});

	it('lists every place, grouped by continent', () => {
		const { container } = renderModal();
		const rows = container.querySelectorAll('[data-city-id]');

		expect(rows).toHaveLength(CITIES.length);
		expect(container.textContent).toContain('ASIA / 5');
		expect(container.textContent).toContain('EUROPE / 2');
		expect(container.textContent).toContain('NORTH AMERICA / 1');
	});

	it('names every place in the legend, in city order within its continent', () => {
		const { container } = renderModal();
		const rows = Array.from(container.querySelectorAll('[data-city-id]'));

		expect(rows.map((row) => row.getAttribute('data-city-id'))).toEqual([
			'hong-kong',
			'taipei',
			'chengdu',
			'shanghai',
			'singapore',
			'livingston',
			'bath',
			'swansea'
		]);
	});

	it('draws one point per place instead of a numbered marker', () => {
		const { container } = renderModal();
		const markers = Array.from(container.querySelectorAll('[data-marker-id]'));

		expect(markers).toHaveLength(CITIES.length);
		for (const marker of markers) {
			expect(marker.textContent?.trim()).toBe('');
		}
	});

	it('renders a themed basemap and credits it', () => {
		const { container } = renderModal();
		const tiles = container.querySelectorAll('img');

		expect(tiles.length).toBeGreaterThan(0);
		expect(container.textContent).toContain('OpenStreetMap');
	});

	it('closes on the close button', async () => {
		const { container, closed } = renderModal();
		const button = container.querySelector('[role="dialog"] button');

		await fireEvent.click(button as HTMLElement);

		expect(closed()).toBe(1);
	});

	it('closes on Escape', async () => {
		const { closed } = renderModal();

		await fireEvent.keyDown(window, { key: 'Escape' });

		expect(closed()).toBe(1);
	});

	it('closes on a backdrop click, so the map is easy to dismiss', async () => {
		const { container, closed } = renderModal();

		await fireEvent.click(container.querySelector('[data-modal-backdrop]') as HTMLElement);

		expect(closed()).toBe(1);
	});

	it('moves focus into the dialog on open', async () => {
		const { container } = renderModal();
		await tick();

		const dialog = container.querySelector('[role="dialog"]');

		expect(dialog?.contains(document.activeElement)).toBe(true);
	});

	it('returns focus to the trigger on close', async () => {
		const trigger = document.createElement('button');
		document.body.appendChild(trigger);
		trigger.focus();

		const { unmount } = render(CityMapModal, { props: { onClose: () => undefined } });
		await tick();
		unmount();

		expect(document.activeElement).toBe(trigger);
		trigger.remove();
	});

	it('keeps tab focus inside the dialog', async () => {
		const { container } = renderModal();
		await tick();

		const dialog = container.querySelector('[role="dialog"]') as HTMLElement;
		const focusable = Array.from(dialog.querySelectorAll('button'));
		const last = focusable[focusable.length - 1];
		last.focus();

		await fireEvent.keyDown(window, { key: 'Tab' });

		expect(document.activeElement).toBe(focusable[0]);
	});

	it('highlights the matching marker when a legend row is hovered', async () => {
		const { container } = renderModal();
		const row = container.querySelector('[data-city-id="swansea"]') as HTMLElement;
		const marker = container.querySelector('[data-marker-id="swansea"]');

		expect(marker?.getAttribute('data-active')).toBeNull();

		await fireEvent.mouseEnter(row);
		await tick();

		expect(marker?.getAttribute('data-active')).toBe('true');
		expect(container.textContent).toContain('Swansea');
	});

	it('highlights the marker on keyboard focus too', async () => {
		const { container } = renderModal();
		const row = container.querySelector('[data-city-id="livingston"]') as HTMLElement;

		await fireEvent.focus(row);
		await tick();

		expect(
			container.querySelector('[data-marker-id="livingston"]')?.getAttribute('data-active')
		).toBe('true');
	});

	it('clears the highlight when the row is left', async () => {
		const { container } = renderModal();
		const row = container.querySelector('[data-city-id="bath"]') as HTMLElement;
		const marker = container.querySelector('[data-marker-id="bath"]');

		await fireEvent.mouseEnter(row);
		await tick();
		await fireEvent.mouseLeave(row);
		await tick();

		expect(marker?.getAttribute('data-active')).toBeNull();
	});
});
