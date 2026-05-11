<script lang="ts">
    import NavItem from "./NavItem.svelte";
    import { base } from "$app/paths";
</script>

<div class="flex justify-center border border-secondary-200 bg-black p-1 mt-12">
    <ul class="flex sm:flex-row flex-col p-2 sm:space-x-8 items-center flex-wrap">
        <NavItem href="{base}/" text="Home" />
        <NavItem href="{base}/experience" text="Experience" />
        <NavItem href="{base}/projects" text="Projects" />
        <NavItem href="{base}/ethos" text="&et" />
        <NavItem href="{base}/manifest" text="Manifest" />
    </ul>
</div>
