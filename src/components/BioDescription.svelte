<script lang="ts">
    import Age from './Age.svelte';
    import { yearsOfExperience } from '$lib/identity';

    let className: string = 'text-sm';
    export { className as class };

    $: yearsInExperience = yearsOfExperience();
</script>

<p class={className}>
    Hi, I'm Thompson, a <Age floored={true} /> year old software engineer
    with <span class="underline">{yearsInExperience}
    years of experience</span> building and shipping production software at scale.
    I've lived in <span class="underline">8 different cities across 3 continents</span>,
    which has given me a broad perspective on technology and problem-solving.
    I'm currently on placement at Amazon, and previously I worked on GenAI pipelines
    at MSD and research software at the University of Bath.
</p>
<p class={className}>
    I'm deeply curious about how systems work from first principles, whether that's
    foundational technology or bleeding-edge tooling. Understanding what's happening
    under the hood means I get far more out of AI-assisted development than most.
</p>
