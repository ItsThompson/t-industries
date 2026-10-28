<script lang="ts">
    import MetadataBar from './industrial/MetadataBar.svelte';
    import { identity } from '$lib/identity';
    import { now } from '$lib/clock';
</script>

<footer>
    <MetadataBar position="bottom">
        <span>{identity.archiveRef}</span>
        <span>{identity.manufacturingDate}</span>
        <span>{$now}</span>
        <span>t-industries (ti) no rights reserved.</span>
    </MetadataBar>
</footer>
