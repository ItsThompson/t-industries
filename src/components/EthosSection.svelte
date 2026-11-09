<script lang="ts">
    import { onMount } from 'svelte';
    import { afterNavigate } from '$app/navigation';
    import { page } from '$app/stores';
    import Compartment from './industrial/Compartment.svelte';
    import MetadataBar from './industrial/MetadataBar.svelte';
    import SectionHeading from './industrial/SectionHeading.svelte';
    import { ethosAnchorId, ETHOS_ITEMS } from '$lib/ethos';
    import { ACCENTS } from '$lib/accents';
    import { readHighlightTarget, revealElement } from '$lib/deep-links';

    $: highlightedTarget = readHighlightTarget($page.url);

    function revealHighlightedRow(target: string | null): void {
        if (!target) return;
        revealElement(ethosAnchorId(target));
    }

    // The layout resets the scroll region on every navigation, so the reveal has
    // to run after that reset to survive a link from another route.
    afterNavigate(() => revealHighlightedRow(readHighlightTarget($page.url)));
    onMount(() => revealHighlightedRow(readHighlightTarget($page.url)));
</script>

<section id="ethos">
    <MetadataBar position="top">
        <span>PRINCIPLES: {ETHOS_ITEMS.length}</span>
    </MetadataBar>

    <div class="mt-4">
        <SectionHeading level={1} text="ETHOS" />
    </div>

    <div class="mt-6">
        <Compartment>
            <div class="space-y-6">
                {#each ETHOS_ITEMS as item}
                    {@const highlighted = highlightedTarget === item.id}
                    <div
                        id={ethosAnchorId(item.id)}
                        class="grid grid-cols-12 gap-3 items-start scroll-mt-4 transition-colors {highlighted
                            ? 'border-l-2 pl-3 -ml-3'
                            : ''}"
                        style:border-color={highlighted ? ACCENTS.primary : null}
                        data-ethos-id={item.id}
                        data-highlighted={highlighted ? 'true' : undefined}
                    >
                        <h2 class="col-span-12 md:col-span-2 text-sm font-bold font-mono text-white">
                            {item.title}
                        </h2>
                        <p class="col-span-12 md:col-span-4 text-xs font-mono text-secondary-100 leading-relaxed">
                            {item.description}
                        </p>
                        <p class="col-span-12 md:col-span-6 text-xs font-mono text-secondary-100 leading-relaxed">
                            {item.walkingTheWalk}
                        </p>
                    </div>
                {/each}
            </div>
        </Compartment>
    </div>
</section>
