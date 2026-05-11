<script lang="ts">
    import Compartment from './industrial/Compartment.svelte';
    import type { PinnedProject } from '$lib/github';

    export let project: PinnedProject;
</script>

<Compartment>
    <div class="space-y-2">
        <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="display-md text-white hover:text-primary transition-colors"
        >
            {project.name}
        </a>
        {#if project.description}
            <p class="text-sm font-mono text-secondary-100 leading-relaxed">
                {project.description}
            </p>
        {/if}
        {#if project.primaryLanguage}
            <div class="flex items-center gap-2 pt-2">
                <span
                    class="inline-block w-3 h-3 rounded-full"
                    style="background-color: {project.primaryLanguage.color}"
                ></span>
                <span class="label-sm text-secondary-200">
                    {project.primaryLanguage.name}
                </span>
            </div>
        {/if}
    </div>
</Compartment>
