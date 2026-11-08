<script lang="ts">
    import { onMount } from 'svelte';
    import CityMap from './CityMap.svelte';
    import { CITIES, CITY_COUNT, citiesByContinent, continentCount } from '$lib/cities';
    import { MAP_ATTRIBUTION } from '$lib/map-tiles';

    export let onClose: () => void;

    const groups = citiesByContinent(CITIES);
    const continents = continentCount(CITIES);

    let panel: HTMLDivElement;
    let closeButton: HTMLButtonElement;
    let activeId: string | null = null;
    let previouslyFocused: Element | null = null;

    const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    onMount(() => {
        previouslyFocused = document.activeElement;
        closeButton?.focus();

        return () => {
            if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
        };
    });

    function focusableElements(): HTMLElement[] {
        if (!panel) return [];
        return Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
            (element) => !element.hasAttribute('disabled')
        );
    }

    function handleKeydown(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            event.preventDefault();
            onClose();
            return;
        }

        if (event.key !== 'Tab') return;

        const elements = focusableElements();
        if (elements.length === 0) return;

        const first = elements[0];
        const last = elements[elements.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
            return;
        }

        if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div
        class="absolute inset-0 bg-black/85"
        role="presentation"
        on:click={onClose}
        data-modal-backdrop
    ></div>

    <div
        bind:this={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="places-title"
        class="relative w-full max-w-5xl max-h-[90dvh] overflow-y-auto overscroll-contain border border-secondary-200 bg-black"
    >
        <div class="flex items-start justify-between gap-4 border-b border-secondary-200 p-3">
            <div>
                <p class="label-xs text-secondary-200">
                    GEO / {CITY_COUNT} CITIES / {continents} CONTINENTS
                </p>
                <h2 id="places-title" class="display-md mt-1">PLACES LIVED</h2>
            </div>
            <button
                bind:this={closeButton}
                type="button"
                on:click={onClose}
                class="label-sm shrink-0 border border-secondary-200 px-2 py-1 text-secondary-100 transition-colors duration-150 hover:border-primary hover:text-primary"
            >
                CLOSE [ESC]
            </button>
        </div>

        <div class="grid grid-cols-1 gap-4 p-3 md:grid-cols-[minmax(0,1fr)_12rem]">
            <CityMap cities={CITIES} {activeId} />

            <div class="space-y-3">
                {#each groups as group}
                    <div>
                        <p class="label-xs mb-1 text-secondary-200">
                            {group.continent.toUpperCase()} / {group.cities.length}
                        </p>
                        <ul>
                            {#each group.cities as city (city.id)}
                                <li>
                                    <button
                                        type="button"
                                        class="block w-full text-left transition-colors duration-150 hover:text-primary focus-visible:text-primary focus-visible:outline focus-visible:outline-1 focus-visible:outline-primary"
                                        on:mouseenter={() => (activeId = city.id)}
                                        on:mouseleave={() => (activeId = null)}
                                        on:focus={() => (activeId = city.id)}
                                        on:blur={() => (activeId = null)}
                                        data-city-id={city.id}
                                    >
                                        <span class="label-sm block text-white">{city.name}</span>
                                        <span class="label-xs block text-secondary-200">
                                            {city.region}
                                        </span>
                                    </button>
                                </li>
                            {/each}
                        </ul>
                    </div>
                {/each}
            </div>
        </div>

        <p class="label-xs border-t border-secondary-200 p-2 text-secondary-200">
            BASEMAP: {MAP_ATTRIBUTION}
        </p>
    </div>
</div>
