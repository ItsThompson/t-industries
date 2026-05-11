<script lang="ts">
    import Chevrons from './Chevrons.svelte';

    export let level: 2 | 3 | 4 = 2;
    export let text: string;
    export let chevronCount: number = 4;

    $: tag = `h${level}` as 'h2' | 'h3' | 'h4';
    $: sizeClass = level === 2 ? 'display-lg' : 'display-md';
</script>

<svelte:element this={tag} class="font-display uppercase tracking-wider {sizeClass}">
    <span class="mr-2"><Chevrons count={chevronCount} /></span>{text}
</svelte:element>
