<script lang="ts">
    import "../app.css";
    import Navbar from "../components/NavBar.svelte";
</script>

<div
    class="h-screen w-screen flex flex-col justify-center items-center m-auto bg-black"
>
    <div class="w-4/5 border p-5 flex flex-col items-center gap-5">
        <slot />
    </div>
    <Navbar />
</div>
