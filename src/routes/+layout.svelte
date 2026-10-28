<script lang="ts">
    import { afterNavigate } from "$app/navigation";
    import "../app.css";
    import Navbar from "../components/NavBar.svelte";
    import Footer from "../components/Footer.svelte";
    import CRTBackground from "../components/shader/CRTBackground.svelte";
    import PipesBackground from "../components/PipesBackground.svelte";

    let scrollRegion: HTMLDivElement;

    // This layout stays mounted across navigations, so its scroll offset carries
    // over from the previous route unless it is reset.
    afterNavigate(() => {
        scrollRegion.scrollTop = 0;
    });
</script>

<CRTBackground />
<PipesBackground />

<div
    class="relative z-10 h-dvh w-full flex flex-col justify-start md:justify-center items-center overflow-hidden py-8"
>
    <!-- No flex-1: the region hugs its content, so the root can center the whole
         stack while the content fits, and the region shrinks to scroll when it does not. -->
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
