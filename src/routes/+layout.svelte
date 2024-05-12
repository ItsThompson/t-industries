<script lang="ts">
    import "../app.css";
    import Navbar from "../components/NavBar.svelte";
</script>

<div
    class="min-h-screen min-w-screen bg-black flex flex-col justify-start md:justify-center items-center m-auto py-8 overflow-auto"
>
    <slot />
    <Navbar />
</div>
