<script lang="ts">
    import MetadataBar from './industrial/MetadataBar.svelte';
    import { now } from '$lib/clock';
</script>

<footer>
    <MetadataBar position="bottom">
        <span>{$now}</span>
        <span>t-industries (ti) no rights reserved.</span>
    </MetadataBar>
</footer>
