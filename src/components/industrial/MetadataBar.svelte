<script lang="ts">
    export let position: 'top' | 'bottom' = 'top';
</script>

<div
    class="flex justify-between items-center label-sm text-secondary-200 uppercase
        {position === 'top' ? 'border-b border-secondary-200 pb-2' : 'border-t border-secondary-200 pt-2'}"
>
    <slot />
</div>
