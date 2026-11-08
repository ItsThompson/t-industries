<script lang="ts">
    import Age from './Age.svelte';
    import InlineLink from './InlineLink.svelte';
    import { yearsOfExperience } from '$lib/identity';
    import { BIO_LINKS } from '$lib/bio-links';

    let className: string = 'text-sm';
    export { className as class };

    $: yearsInExperience = yearsOfExperience();
</script>

<p class={className}>
    Hi, I'm Thompson, a <Age floored={true} /> year old software engineer with
    <span class="underline">{yearsInExperience} years of experience</span>
    building and shipping production software at scale. I've lived in <span
    class="underline">8 different cities across 3 continents</span>, which has
    given me a broad perspective on technology and problem-solving. I had just
    completed my <InlineLink {...BIO_LINKS.amazon}>placement at Amazon</InlineLink>, and finishing my final year at the
    University of Bath, where I studied CS + AI. Previously, I worked on
    <InlineLink {...BIO_LINKS.msd}>LLMOps at MSD</InlineLink> and was a
    <InlineLink {...BIO_LINKS.criisp}>programming research assistant for CRIISP</InlineLink> at the
    University of Bath.
</p>
<p class={className}>
    I'm deeply curious about how <InlineLink {...BIO_LINKS.continuousLearning}
        >systems work from first principles</InlineLink
    >, whether that's foundational technology or bleeding-edge tooling. Understanding
    what's happening under the hood means I get far more out of AI-assisted
    development than most.
</p>
