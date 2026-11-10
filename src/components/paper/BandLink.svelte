<script lang="ts">
    import { PAPER_BAND_CLASSES, paperBandStyle } from '$lib/paper';

    export let href: string;
    export let accent: string;
</script>

<!-- A highlighted phrase that navigates. Unlike InlineAction it reveals no note,
     so it stays a plain anchor for the browser to handle. -->
<a {href} class={PAPER_BAND_CLASSES} style={paperBandStyle(accent)}><slot /></a>
