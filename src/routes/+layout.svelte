<script lang="ts">
    import "../app.css";
    import Navbar from "../components/NavBar.svelte";
    import PipesBackground from "../components/PipesBackground.svelte";
</script>

<PipesBackground />

<div
    class="relative z-10 min-h-screen min-w-screen flex flex-col justify-start md:justify-center items-center m-auto py-8 overflow-auto"
>
    <slot />
    <Navbar />
</div>
