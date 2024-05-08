<script lang="ts">
    import "../app.css";
    import Navbar from "../components/NavBar.svelte";
</script>

<div
    class="h-screen w-screen flex flex-col justify-center items-center m-auto bg-black"
>
    <slot />
    <Navbar />
</div>
