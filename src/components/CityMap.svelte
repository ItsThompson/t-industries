<script lang="ts">
    import type { City } from '$lib/cities';
    import { buildMapLayout, TILE_SIZE } from '$lib/map-tiles';

    export let cities: City[];
    /** Id of the place to call out, driven by the legend. */
    export let activeId: string | null = null;

    $: layout = buildMapLayout(cities);
</script>

<div class="relative overflow-hidden border border-secondary-200 bg-black" aria-hidden="true">
    <div
        class="relative w-full"
        style:aspect-ratio="{layout.width} / {layout.height}"
        data-map-zoom={layout.zoom}
    >
        {#each layout.tiles as tile (tile.key)}
            <img
                src={tile.url}
                alt=""
                width={TILE_SIZE}
                height={TILE_SIZE}
                decoding="async"
                class="absolute contrast-125 brightness-75"
                style:left="{tile.left}%"
                style:top="{tile.top}%"
                style:width="{tile.width}%"
                style:height="{tile.height}%"
            />
        {/each}

        <!-- Scanlines and vignette keep the basemap inside the CRT palette. -->
        <div
            class="absolute inset-0 pointer-events-none mix-blend-screen opacity-30"
            style="background-image: repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.08) 0px, rgba(255, 255, 255, 0.08) 1px, transparent 1px, transparent 3px);"
        ></div>
        <div
            class="absolute inset-0 pointer-events-none"
            style="background: radial-gradient(ellipse at center, transparent 45%, rgba(0, 0, 0, 0.75) 100%);"
        ></div>

        {#each layout.markers as marker (marker.id)}
            {@const active = marker.id === activeId}
            {@const labelOnLeft = marker.left > 72}
            {#if marker.shifted}
                <!-- Leader line back to the city's true position. -->
                <div
                    class="absolute w-px bg-secondary-100"
                    style:left="{marker.anchorLeft}%"
                    style:top="{Math.min(marker.anchorTop, marker.top)}%"
                    style:height="{Math.abs(marker.top - marker.anchorTop)}%"
                ></div>
                <div
                    class="absolute h-1 w-1 -translate-x-1/2 -translate-y-1/2 bg-secondary-100"
                    style:left="{marker.anchorLeft}%"
                    style:top="{marker.anchorTop}%"
                ></div>
            {/if}
            <div
                class="absolute -translate-x-1/2 -translate-y-1/2 {active ? 'z-10' : ''}"
                style:left="{marker.left}%"
                style:top="{marker.top}%"
                data-marker-id={marker.id}
                data-active={active ? 'true' : undefined}
            >
                <span
                    class="block h-2.5 w-2.5 rotate-45 border transition-colors duration-150 {active
                        ? 'scale-125 border-primary bg-primary'
                        : 'border-secondary-100 bg-black'}"
                ></span>
                {#if active}
                    <span
                        class="absolute top-1/2 -translate-y-1/2 label-xs whitespace-nowrap bg-black px-1 py-0.5 text-white border border-primary {labelOnLeft
                            ? 'right-4'
                            : 'left-4'}"
                    >
                        {marker.name}
                    </span>
                {/if}
            </div>
        {/each}
    </div>
</div>
