<script lang="ts">
    import NavItem from "./NavItem.svelte";
    import { base } from "$app/paths";
</script>

<div class="flex justify-center border p-1 mt-12">
    <ul class="flex sm:flex-row flex-col p-2 sm:space-x-8 items-center">
        <NavItem href="{base}/" text="Home" />
        <NavItem href="#" text="Blog" /> <!-- TODO: href -->
        <NavItem href="{base}/projects" text="Projects" />
        <NavItem href="{base}/ethos" text="&et" />
    </ul>
</div>
