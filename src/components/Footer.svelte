<script lang="ts">
    import { onMount } from 'svelte';
    import MetadataBar from './industrial/MetadataBar.svelte';
    import { identity } from '$lib/identity';

    let timestamp = Date.now();

    onMount(() => {
        const interval = setInterval(() => {
            timestamp = Date.now();
        }, 1000);

        return () => clearInterval(interval);
    });
</script>

<footer class="mt-8">
    <MetadataBar position="bottom">
        <span>{identity.archiveRef}</span>
        <span>{identity.manufacturingDate}</span>
        <span>{timestamp}</span>
        <span>t-industries (ti) no rights reserved.</span>
    </MetadataBar>
</footer>
