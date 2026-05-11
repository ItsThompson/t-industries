<script lang="ts">
    export let position: 'top' | 'bottom' = 'top';
</script>

<div
    class="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-1 sm:gap-4 label-sm text-secondary-200 uppercase
        {position === 'top' ? 'border-b border-secondary-200 pb-2' : 'border-t border-secondary-200 pt-2'}"
>
    <slot />
</div>
