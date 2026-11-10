<script lang="ts">
    import { onMount } from "svelte";
    import { afterNavigate } from "$app/navigation";
    import Navbar from "../../components/NavBar.svelte";
    import Footer from "../../components/Footer.svelte";
    import CRTBackground from "../../components/shader/CRTBackground.svelte";
    import PipesBackground from "../../components/PipesBackground.svelte";
    import { observeViewportWidth } from "$lib/viewport";

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
</script>

{#if isWideViewport}
    <CRTBackground />
    <PipesBackground />
{/if}

<div
    class="relative z-10 h-dvh w-full flex flex-col justify-start md:justify-center items-center overflow-hidden py-8"
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
    <Navbar />
</div>
