<script lang="ts">
    import NavItem from "./NavItem.svelte";
    import { base } from "$app/paths";
    import { terminalPath, TERMINAL_PATH } from "$lib/routes";
</script>

<div class="flex justify-center border border-secondary-200 bg-black p-1 mt-12">
    <ul class="flex sm:flex-row flex-col p-2 sm:space-x-8 items-center flex-wrap">
        <NavItem href="{base}{TERMINAL_PATH}" text="home" />
        <NavItem href="{base}{terminalPath('experience')}" text="experience" />
        <NavItem href="{base}{terminalPath('projects')}" text="projects" />
        <NavItem href="{base}{terminalPath('ethos')}" text="&et" />
    </ul>
</div>
