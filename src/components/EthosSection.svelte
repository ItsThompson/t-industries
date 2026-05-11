<script lang="ts">
    import Compartment from './industrial/Compartment.svelte';
    import MetadataBar from './industrial/MetadataBar.svelte';
    import SectionHeading from './industrial/SectionHeading.svelte';
    import { ETHOS_ITEMS } from '$lib/ethos';
</script>

<section id="ethos">
    <MetadataBar position="top">
        <span>PRINCIPLES: {ETHOS_ITEMS.length}</span>
        <span>CLASSIFICATION: CORE</span>
    </MetadataBar>

    <div class="mt-4">
        <SectionHeading level={2} text="ETHOS" prefix=">>>>" />
    </div>

    <div class="mt-6">
        <Compartment>
            <div class="space-y-6">
                {#each ETHOS_ITEMS as item}
                    <div class="grid grid-cols-12 gap-3 items-start">
                        <h3 class="col-span-12 md:col-span-2 text-sm font-bold font-mono text-white">
                            {item.title}
                        </h3>
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
