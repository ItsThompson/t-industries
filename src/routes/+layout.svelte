<script lang="ts">
    import "../app.css";
    import Navbar from "../components/NavBar.svelte";
    import Footer from "../components/Footer.svelte";
    import CRTBackground from "../components/shader/CRTBackground.svelte";
    import PipesBackground from "../components/PipesBackground.svelte";
</script>

<CRTBackground />
<PipesBackground />

<div
    class="relative z-10 min-h-screen min-w-screen flex flex-col justify-start md:justify-center items-center m-auto py-8 overflow-auto"
>
    <div class="w-full max-w-5xl px-4">
        <slot />
        <Footer />
    </div>
    <Navbar />
</div>
