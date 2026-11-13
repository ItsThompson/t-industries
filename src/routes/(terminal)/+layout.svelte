<script lang="ts">
    import { onMount } from "svelte";
    import { afterNavigate } from "$app/navigation";
    import Navbar from "../../components/NavBar.svelte";
    import Footer from "../../components/Footer.svelte";
    import ToastHost from "../../components/toast/ToastHost.svelte";
    import CRTBackground from "../../components/shader/CRTBackground.svelte";
    import PipesBackground from "../../components/PipesBackground.svelte";
    import { observeViewportWidth } from "$lib/viewport";
    import { syncCanvasOriginToast } from "$lib/toasts";
    import "../../terminal.css";

    let scrollRegion: HTMLDivElement;

    // Backgrounds stay unmounted below the threshold so WebGL does not run on phones and tablets 
    let isWideViewport = false;

    onMount(() =>
        observeViewportWidth({
            onWide: () => (isWideViewport = true),
            onNarrow: () => (isWideViewport = false)
        })
    );

    // This layout stays mounted across navigations, so its scroll offset carries over from the previous route unless it is reset.
    afterNavigate(() => {
        scrollRegion.scrollTop = 0;
    });

    // The origin parameter lives in the URL, so arriving and leaving both sync here.
    // It is read from the address bar, not `$page.url`: history navigation restores a
    // stored page url that still carries a marker the reader already dismissed.
    afterNavigate(() => syncCanvasOriginToast(new URL(window.location.href)));
    onMount(() => syncCanvasOriginToast(new URL(window.location.href)));
</script>

<svelte:head>
    <!-- Painted before hydration, so a prerendered terminal page never flashes the cream canvas behind it. -->
    <style>
        body {
            background-color: #000;
        }
    </style>
</svelte:head>

{#if isWideViewport}
    <CRTBackground />
    <PipesBackground />
{/if}

<div
    class="relative z-10 h-dvh w-full flex flex-col justify-start md:justify-center items-center overflow-hidden py-8 font-mono text-white"
>
    <div
        bind:this={scrollRegion}
        class="flex flex-col w-full min-h-0 overflow-y-auto overscroll-none"
    >
        <div class="w-full max-w-5xl px-4 pb-8 mx-auto">
            <slot />
        </div>
        <!-- Scrolls with the content on mobile; the desktop copy below is pinned instead. -->
        <div class="w-full max-w-5xl px-4 mx-auto md:hidden">
            <Footer />
        </div>
    </div>
    <div class="w-full max-w-5xl px-4 mx-auto hidden md:block">
        <Footer />
    </div>
    <ToastHost />
    <Navbar />
</div>
