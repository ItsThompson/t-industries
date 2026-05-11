<script lang="ts">
    import { onDestroy } from 'svelte';
    import MetadataBar from '../../components/industrial/MetadataBar.svelte';
    import { ARCHIVE_REF, getManufacturingDate } from '$lib/metadata';

    const mfgDate = getManufacturingDate();

    let timestamp = Date.now();

    // Update timestamp every second for live display
    const interval = setInterval(() => {
        timestamp = Date.now();
    }, 1000);

    onDestroy(() => clearInterval(interval));
</script>

<footer class="mt-8">
    <MetadataBar position="bottom">
        <span>{ARCHIVE_REF}</span>
        <span>{mfgDate}</span>
        <span>{timestamp}</span>
        <span>t-industries (ti) no rights reserved.</span>
    </MetadataBar>
</footer>
