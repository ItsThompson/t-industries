<script lang="ts">
    import NavItem from "./NavItem.svelte";
    import { base } from "$app/paths";
</script>

<div class="flex justify-center border border-secondary-200 bg-black p-1 mt-12">
    <ul class="flex sm:flex-row flex-col p-2 sm:space-x-8 items-center flex-wrap">
        <NavItem href="{base}/" text="home" />
        <NavItem href="{base}/experience" text="experience" />
        <NavItem href="{base}/projects" text="projects" />
        <NavItem href="{base}/ethos" text="&et" />
    </ul>
</div>
