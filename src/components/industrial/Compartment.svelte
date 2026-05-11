<script lang="ts">
    export let title: string | undefined = undefined;
</script>

<div class="border border-secondary-200 bg-black p-4">
    {#if title}
        <div class="label-sm text-secondary-200 mb-2 pb-2 border-b border-secondary-200">
            {title}
        </div>
    {/if}
    <slot />
</div>
