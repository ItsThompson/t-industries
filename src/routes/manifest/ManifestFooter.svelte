<script lang="ts">
    import MetadataBar from '../../components/industrial/MetadataBar.svelte';
    import { ARCHIVE_REF, getManufacturingDate } from '$lib/metadata';

    const mfgDate = getManufacturingDate();

    let timestamp = Date.now();

    // Update timestamp every second for live display
    const interval = setInterval(() => {
        timestamp = Date.now();
    }, 1000);

    import { onDestroy } from 'svelte';
    onDestroy(() => clearInterval(interval));
</script>

<footer class="col-span-12 mt-8">
    <MetadataBar position="bottom">
        <span>{ARCHIVE_REF} // {mfgDate} // {timestamp} // t-industries (ti) no rights reserved.</span>
    </MetadataBar>
</footer>
