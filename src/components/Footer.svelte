<script lang="ts">
    import { onDestroy } from 'svelte';
    import MetadataBar from './industrial/MetadataBar.svelte';
    import { ARCHIVE_REF, getManufacturingDate } from '$lib/metadata';

    const mfgDate = getManufacturingDate();

    let timestamp = Date.now();

    const interval = setInterval(() => {
        timestamp = Date.now();
    }, 1000);

    onDestroy(() => clearInterval(interval));
</script>

<footer class="mt-8 w-full max-w-5xl px-4">
    <MetadataBar position="bottom">
        <span>{ARCHIVE_REF}</span>
        <span>{mfgDate}</span>
        <span>{timestamp}</span>
        <span>t-industries (ti) no rights reserved.</span>
    </MetadataBar>
</footer>
