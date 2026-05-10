<script lang="ts">
    import Project from "../../components/FeaturedProjectItem.svelte";
    import type { PageData } from './$types';

    export let data: PageData;
</script>

<div
    class="w-11/12 md:w-1/2 lg:w-2/5 2xl:w-1/3
border bg-black p-5 flex flex-col items-center gap-5"
>
    <div class="self-start">
        <h4 class="text-xl font-bold underline">Featured Projects</h4>
    </div>

    {#if data.projects.length === 0}
        <p class="text-sm text-gray-400">No pinned projects found.</p>
    {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 items-start gap-8">
            {#each data.projects as project}
                <Project
                    github={project.githubUrl}
                    website={project.homepageUrl}
                    name={project.name}
                    desc={project.description}
                    language={project.primaryLanguage?.name ?? ""}
                    languageColor={project.primaryLanguage?.color ?? ""}
                />
            {/each}
        </div>
    {/if}
</div>
