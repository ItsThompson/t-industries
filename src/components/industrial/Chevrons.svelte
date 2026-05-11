<script lang="ts">
    export let count: number = 4;
    export let color: 'muted' | 'accent' = 'muted';
</script>

<span
    aria-hidden="true"
    class="{color === 'accent' ? 'text-primary' : 'text-secondary-200'} font-mono"
>{'>'.repeat(count)}</span>
