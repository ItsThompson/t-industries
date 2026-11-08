<script lang="ts">
    import Age from './Age.svelte';
    import InlineAction from './InlineAction.svelte';
    import CityMapModal from './CityMapModal.svelte';
    import { yearsOfExperience } from '$lib/identity';
    import { BIO_LINKS, BIO_PLACES_ACTION } from '$lib/bio-links';

    let className: string = 'text-sm';
    export { className as class };

    let mapOpen = false;

    $: yearsInExperience = yearsOfExperience();
</script>

<p class={className}>
    Hi, I'm Thompson, a <Age floored={true} /> year old software engineer with
    <span class="underline">{yearsInExperience} years of experience</span>
    building and shipping production software at scale. I've lived in <InlineAction
        {...BIO_PLACES_ACTION}
        hint="CLICK TO OPEN MAP"
        onActivate={() => (mapOpen = true)}>8 different cities across 3 continents</InlineAction
    >, which has given me a broad perspective on technology and problem-solving. I had
    just completed my <InlineAction {...BIO_LINKS.amazon}>placement at Amazon</InlineAction>, and finishing my final year at the
    University of Bath, where I studied CS + AI. Previously, I worked on
    <InlineAction {...BIO_LINKS.msd}>LLMOps at MSD</InlineAction> and was a
    <InlineAction {...BIO_LINKS.criisp}>programming research assistant for CRIISP</InlineAction> at the
    University of Bath.
</p>
<p class={className}>
    I'm deeply curious about how <InlineAction {...BIO_LINKS.continuousLearning}
        >systems work from first principles</InlineAction
    >, whether that's foundational technology or bleeding-edge tooling. Understanding
    what's happening under the hood means I get far more out of AI-assisted
    development than most.
</p>

{#if mapOpen}
    <CityMapModal onClose={() => (mapOpen = false)} />
{/if}
