<script lang="ts">
    import NavItem from "./NavItem.svelte";
</script>

<div class="flex justify-center border p-1 mt-12">
    <ul class="flex flex-row p-2 space-x-8">
        <NavItem href="/" text="Home" />
        <NavItem href="/projects" text="Projects" />
        <NavItem href="/about" text="About" />
        <NavItem href="/contact" text="Contact" />
    </ul>
</div>
