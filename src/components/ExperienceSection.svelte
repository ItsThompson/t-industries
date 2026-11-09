<script lang="ts">
    import { onMount } from 'svelte';
    import { afterNavigate } from '$app/navigation';
    import { page } from '$app/stores';
    import Crosshair from './industrial/Crosshair.svelte';
    import MetadataBar from './industrial/MetadataBar.svelte';
    import SectionHeading from './industrial/SectionHeading.svelte';
    import ExperienceCard from './ExperienceCard.svelte';
    import { experienceAnchorId, experiences } from '$lib/experiences';
    import { readHighlightTarget, revealElement } from '$lib/deep-links';

    const orgCount = experiences.length;

    $: highlightedTarget = readHighlightTarget($page.url);

    function revealHighlightedEntry(target: string | null): void {
        if (!target) return;
        revealElement(experienceAnchorId(target));
    }

    // The layout resets the scroll region on every navigation, so the reveal has
    // to run after that reset to survive a link from another route.
    afterNavigate(() => revealHighlightedEntry(readHighlightTarget($page.url)));
    onMount(() => revealHighlightedEntry(readHighlightTarget($page.url)));
</script>

<section id="experience" class="relative">
    <!-- Crosshair markers at section corners (hidden on mobile) -->
    <div class="hidden md:block absolute top-0 left-0">
        <Crosshair />
    </div>
    <div class="hidden md:block absolute top-0 right-0">
        <Crosshair />
    </div>
    <div class="hidden md:block absolute bottom-0 left-0">
        <Crosshair />
    </div>
    <div class="hidden md:block absolute bottom-0 right-0">
        <Crosshair />
    </div>

    <div class="py-4 px-2">
        <MetadataBar position="top">
            <span>ORGS: {orgCount}</span>
        </MetadataBar>

        <div class="mt-4">
            <SectionHeading level={1} text="EXPERIENCE" />
        </div>

        <div class="relative mt-4">
            <!-- Central vertical line (desktop) / left-aligned line (mobile) -->
            <div
                class="absolute top-0 bottom-0 w-px bg-secondary-200 left-3 md:left-1/2 md:-translate-x-px"
            ></div>

            <div class="flex flex-col gap-8">
                {#each experiences as experience, index}
                    {@const side = index % 2 === 0 ? 'left' : 'right'}
                    {@const highlighted = highlightedTarget === experience.id}
                    <div
                        id={experienceAnchorId(experience.id)}
                        class="relative grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4 scroll-mt-4"
                        data-experience-id={experience.id}
                        data-highlighted={highlighted ? 'true' : undefined}
                    >
                        <!-- Left card (desktop only for even index) -->
                        <div class="hidden md:block {side === 'left' ? '' : 'invisible'}">
                            {#if side === 'left'}
                                <ExperienceCard {experience} alignment="left" {highlighted} />
                            {/if}
                        </div>

                        <!-- Dot marker -->
                        <div class="hidden md:flex justify-center">
                            <div class="w-3 h-3 rounded-full bg-primary border border-primary z-10"></div>
                        </div>

                        <!-- Right card (desktop only for odd index) -->
                        <div class="hidden md:block {side === 'right' ? '' : 'invisible'}">
                            {#if side === 'right'}
                                <ExperienceCard {experience} alignment="right" {highlighted} />
                            {/if}
                        </div>

                        <!-- Mobile card (always visible on mobile) -->
                        <div class="md:hidden pl-8 relative">
                            <div
                                class="absolute left-[9px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary border border-primary z-10"
                            ></div>
                            <ExperienceCard {experience} alignment="right" {highlighted} />
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </div>
</section>
