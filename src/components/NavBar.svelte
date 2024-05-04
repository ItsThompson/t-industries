<script lang="ts">
    import NavItem from "./NavItem.svelte";
</script>

<ul class="flex flex-row p-2 space-x-8">
    <NavItem href="#" isThisPage={true} text="Home" />
    <NavItem href="#" text="About" />
    <NavItem href="#" text="Projects" />
    <NavItem href="#" text="Contact" />
</ul>
