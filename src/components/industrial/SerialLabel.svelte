<script lang="ts">
    export let prefix: string | undefined = undefined;
    export let number: number | undefined = undefined;
    export let text: string | undefined = undefined;
</script>

<span class="label-sm text-secondary-200">{#if text}{text}{:else if prefix !== undefined && number !== undefined}{prefix}-{String(number).padStart(4, '0')}{/if}</span>
