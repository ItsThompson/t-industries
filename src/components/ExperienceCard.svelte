<script lang="ts">
    import Compartment from './industrial/Compartment.svelte';
    import type { Experience } from '$lib/experiences';

    export let experience: Experience;
    export let alignment: 'left' | 'right' = 'left';
</script>

<Compartment title={experience.company}>
    <div class="space-y-2 {alignment === 'left' ? 'md:text-right' : ''}">
        <p class="text-sm font-mono text-white font-bold">{experience.role}</p>
        <p class="label-sm text-secondary-200">
            {experience.startDate} - {experience.endDate}
        </p>
        <p class="text-sm font-mono text-secondary-100 leading-relaxed">
            {experience.description}
        </p>
    </div>
</Compartment>
