<script lang="ts">
    import Modal from './Modal.svelte';
    import CityMap from './CityMap.svelte';
    import { CITIES, CITY_COUNT, citiesByContinent, continentCount } from '$lib/cities';
    import { MAP_ATTRIBUTION } from '$lib/map-tiles';

    export let onClose: () => void;
    export let restoreFocus = true;

    const groups = citiesByContinent(CITIES);
    const continents = continentCount(CITIES);

    let activeId: string | null = null;
</script>

<Modal titleId="places-title" {onClose} {restoreFocus}>
    <span slot="heading">
        <p class="label-xs text-secondary-200">
            GEO / {CITY_COUNT} CITIES / {continents} CONTINENTS
        </p>
        <h2 id="places-title" class="display-md mt-1">PLACES LIVED</h2>
    </span>

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
</Modal>
