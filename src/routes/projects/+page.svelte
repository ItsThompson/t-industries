<script lang="ts">
    import SectionHeading from '../../components/industrial/SectionHeading.svelte';
    import MetadataBar from '../../components/industrial/MetadataBar.svelte';
    import Compartment from '../../components/industrial/Compartment.svelte';
    import ProjectCard from '../../components/ProjectCard.svelte';
    import type { PageData } from './$types';

    export let data: PageData;
</script>

<div class="w-full max-w-5xl px-4">
    <MetadataBar position="top">
        <span>PINNED: {data.projects.length}</span>
        <span>SOURCE: github.com/ItsThompson</span>
    </MetadataBar>

    <div class="mt-4">
        <SectionHeading level={2} text="PROJECTS" prefix=">>>>" />
    </div>

    {#if data.projects.length === 0}
        <div class="mt-6">
            <Compartment>
                <p class="text-secondary-200 font-mono text-sm text-center">
                    No pinned projects found.
                </p>
            </Compartment>
        </div>
    {:else}
        <div class="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each data.projects as project}
                <ProjectCard {project} />
            {/each}
        </div>
    {/if}
</div>
