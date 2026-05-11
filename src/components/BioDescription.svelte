<script lang="ts">
    import Age from './Age.svelte';
    import { yearsOfExperience } from '$lib/identity';

    let className: string = 'text-sm';
    export { className as class };

    $: yearsInExperience = yearsOfExperience();
</script>

<p class={className}>
    Hi, I am Thompson, a <Age floored={true} /> year old software engineer
    with <span class="underline">{yearsInExperience}
    years of experience</span> building and shipping production software at scale.
    I have lived in <span class="underline">7 different cities across 3 continents</span>,
    bringing a <span class="underline">multicultural perspective</span>
    to every team I work on. Currently on placement at Amazon, previously
    building GenAI pipelines at MSD and research software at the University of Bath.
</p>
