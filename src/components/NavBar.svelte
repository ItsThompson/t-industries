<script lang="ts">
    import NavItem from "./NavItem.svelte";
</script>

<div class="flex justify-center border p-1 mt-12">
    <ul class="flex sm:flex-row flex-col p-2 sm:space-x-8 items-center">
        <NavItem href="/" text="Home" />
        <NavItem href="#" text="Blog" /> <!-- TODO: href -->
        <NavItem href="/projects" text="Projects" />
        <NavItem href="/ethos" text="&et" />
    </ul>
</div>
