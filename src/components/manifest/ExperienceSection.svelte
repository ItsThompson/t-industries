<script lang="ts">
    import Compartment from '../industrial/Compartment.svelte';
    import Crosshair from '../industrial/Crosshair.svelte';
    import Divider from '../industrial/Divider.svelte';
    import MetadataBar from '../industrial/MetadataBar.svelte';
    import SectionHeading from '../industrial/SectionHeading.svelte';
    import { experiences } from '$lib/experiences';
    import { getExperienceCycles } from '$lib/metadata';

    const experienceCycles = getExperienceCycles();
    const orgCount = experiences.length;
</script>

<Divider label="EXPERIENCE" />

<section id="experience" class="relative mt-6">
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
        <SectionHeading level={2} text="EXPERIENCE LOG" />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {#each experiences as experience}
                <Compartment title={experience.company}>
                    <div class="space-y-2">
                        <p class="body-base text-white font-bold">{experience.role}</p>
                        <p class="label-sm text-secondary-200">
                            {experience.startDate} - {experience.endDate}
                        </p>
                        <p class="body-sm text-secondary-100 leading-relaxed">
                            {experience.description}
                        </p>
                    </div>
                </Compartment>
            {/each}
        </div>

        <div class="mt-4">
            <MetadataBar position="bottom">
                <span>{experienceCycles} // ORGS: {orgCount}</span>
            </MetadataBar>
        </div>
    </div>
</section>
