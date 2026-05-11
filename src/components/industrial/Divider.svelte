<script lang="ts">
    export let label: string | undefined = undefined;
</script>

<div aria-hidden="true" class="text-secondary-200 font-mono w-full">
    {#if label}
        <span>──── {label} ────</span>
    {:else}
        <span>────────────────────────────────────────</span>
    {/if}
</div>
