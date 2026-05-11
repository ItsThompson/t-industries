<script lang="ts">
    import Compartment from './industrial/Compartment.svelte';
    import Crosshair from './industrial/Crosshair.svelte';
    import MetadataBar from './industrial/MetadataBar.svelte';
    import SectionHeading from './industrial/SectionHeading.svelte';
    import { experiences } from '$lib/experiences';
    import { getExperienceCycles } from '$lib/metadata';

    const experienceCycles = getExperienceCycles();
    const orgCount = experiences.length;
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
            <span>{experienceCycles}</span>
            <span>ORGS: {orgCount}</span>
        </MetadataBar>

        <div class="mt-4">
            <SectionHeading level={2} text="EXPERIENCE" prefix=">>>>" />
        </div>

        <div class="relative mt-4">
            <!-- Central vertical line (desktop) / left-aligned line (mobile) -->
            <div
                class="absolute top-0 bottom-0 w-px bg-secondary-200 left-3 md:left-1/2 md:-translate-x-px"
            ></div>

            <div class="flex flex-col gap-8">
                {#each experiences as experience, index}
                    {@const side = index % 2 === 0 ? 'left' : 'right'}
                    <div class="relative grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4">
                        <!-- Left card (desktop only for even index) -->
                        <div class="hidden md:block {side === 'left' ? '' : 'invisible'}">
                            {#if side === 'left'}
                                <Compartment title={experience.company}>
                                    <div class="space-y-2 md:text-right">
                                        <p class="text-sm font-mono text-white font-bold">{experience.role}</p>
                                        <p class="label-sm text-secondary-200">
                                            {experience.startDate} - {experience.endDate}
                                        </p>
                                        <p class="text-sm font-mono text-secondary-100 leading-relaxed">
                                            {experience.description}
                                        </p>
                                    </div>
                                </Compartment>
                            {/if}
                        </div>

                        <!-- Dot marker -->
                        <div class="hidden md:flex justify-center">
                            <div class="w-3 h-3 rounded-full bg-primary border border-primary z-10"></div>
                        </div>

                        <!-- Right card (desktop only for odd index) -->
                        <div class="hidden md:block {side === 'right' ? '' : 'invisible'}">
                            {#if side === 'right'}
                                <Compartment title={experience.company}>
                                    <div class="space-y-2">
                                        <p class="text-sm font-mono text-white font-bold">{experience.role}</p>
                                        <p class="label-sm text-secondary-200">
                                            {experience.startDate} - {experience.endDate}
                                        </p>
                                        <p class="text-sm font-mono text-secondary-100 leading-relaxed">
                                            {experience.description}
                                        </p>
                                    </div>
                                </Compartment>
                            {/if}
                        </div>

                        <!-- Mobile card (always visible on mobile) -->
                        <div class="md:hidden pl-8 relative">
                            <div
                                class="absolute left-[9px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary border border-primary z-10"
                            ></div>
                            <Compartment title={experience.company}>
                                <div class="space-y-2">
                                    <p class="text-sm font-mono text-white font-bold">{experience.role}</p>
                                    <p class="label-sm text-secondary-200">
                                        {experience.startDate} - {experience.endDate}
                                    </p>
                                    <p class="text-sm font-mono text-secondary-100 leading-relaxed">
                                        {experience.description}
                                    </p>
                                </div>
                            </Compartment>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </div>
</section>
