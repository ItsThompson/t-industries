<script lang="ts">
    export let title: string | undefined = undefined;
    /** Brand color that marks this compartment as the current target. */
    export let accent: string | null = null;
</script>

<div
    class="border bg-black p-4 {accent ? '' : 'border-secondary-200'}"
    style:border-color={accent}
>
    {#if title}
        <div
            class="label-sm mb-2 pb-2 border-b border-secondary-200 {accent
                ? ''
                : 'text-secondary-200'}"
            style:color={accent}
        >
            {title}
        </div>
    {/if}
    <slot />
</div>
