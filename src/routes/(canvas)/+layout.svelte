<script lang="ts">
    import { base } from '$app/paths';
    import { CANVAS_GRAIN_OPACITY } from '$lib/canvas';
    import {
        GOOGLE_FONTS_ORIGIN,
        GOOGLE_FONTS_STATIC_ORIGIN,
        OUTFIT_STYLESHEET_HREF
    } from '$lib/fonts';
    import { RippleBackground } from '../../components/ripple';
</script>

<svelte:head>
    <link rel="preconnect" href={GOOGLE_FONTS_ORIGIN} />
    <link rel="preconnect" href={GOOGLE_FONTS_STATIC_ORIGIN} crossorigin="anonymous" />
    <link href={OUTFIT_STYLESHEET_HREF} rel="stylesheet" />
    <!-- Painted before hydration, so a prerendered page never flashes the black site. -->
    <style>
        body {
            background-color: #F4EFE2;
        }
    </style>
</svelte:head>

<!-- The layout owns the backdrop, painted in this order: body colour, grain, ripples,
     then the route content. Every layer stays z-auto so the DOM decides the order. -->
<div
    aria-hidden="true"
    class="pointer-events-none fixed inset-0 mix-blend-multiply"
    style:background-image="url({base}/grain.svg)"
    style:opacity={CANVAS_GRAIN_OPACITY}
></div>

<RippleBackground />

<slot />
