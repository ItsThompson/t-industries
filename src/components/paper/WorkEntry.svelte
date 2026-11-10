<script lang="ts">
    import { experienceAnchorId, type HighlightedExperience } from '$lib/experiences';

    export let experience: HighlightedExperience;
</script>

<article id={experienceAnchorId(experience.id)} class="mb-7 scroll-mt-24 last:mb-0">
    <h3 class="text-lg font-medium">{experience.company}</h3>
    <p class="mb-1.5 mt-0.5 text-sm text-paper-muted">
        {experience.role} &middot; {experience.startDate} to {experience.endDate}
    </p>
    <p class="text-base font-light leading-relaxed">{experience.highlightSummary}</p>
</article>
