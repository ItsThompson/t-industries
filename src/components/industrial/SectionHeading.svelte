<script lang="ts">
    export let level: 2 | 3 | 4 = 2;
    export let text: string;
    export let prefix: string | undefined = undefined;
    export let suffix: string | undefined = undefined;
</script>

{#if level === 2}
    <h2 class="font-display uppercase tracking-wider display-lg">
        {#if prefix}<span class="text-secondary-200 mr-2">{prefix}</span>{/if}{text}{#if suffix}<span class="text-secondary-200 ml-2">{suffix}</span>{/if}
    </h2>
{:else if level === 3}
    <h3 class="font-display uppercase tracking-wider display-md">
        {#if prefix}<span class="text-secondary-200 mr-2">{prefix}</span>{/if}{text}{#if suffix}<span class="text-secondary-200 ml-2">{suffix}</span>{/if}
    </h3>
{:else}
    <h4 class="font-display uppercase tracking-wider display-md">
        {#if prefix}<span class="text-secondary-200 mr-2">{prefix}</span>{/if}{text}{#if suffix}<span class="text-secondary-200 ml-2">{suffix}</span>{/if}
    </h4>
{/if}
