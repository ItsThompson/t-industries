<script lang="ts">
    export let level: 2 | 3 | 4 = 2;
    export let text: string;
    export let prefix: string | undefined = undefined;
    export let suffix: string | undefined = undefined;

    $: tag = `h${level}` as 'h2' | 'h3' | 'h4';
    $: sizeClass = level === 2 ? 'display-lg' : 'display-md';
</script>

<svelte:element this={tag} class="font-display uppercase tracking-wider {sizeClass}">
    {#if prefix}<span class="text-secondary-200 mr-2">{prefix}</span>{/if}{text}{#if suffix}<span class="text-secondary-200 ml-2">{suffix}</span>{/if}
</svelte:element>
