<script lang="ts">
    import { experienceAnchorId, type HighlightedExperience } from '$lib/experiences';
    import { paperBandStyle } from '$lib/paper';

    export let experience: HighlightedExperience;
</script>

<article
    id={experienceAnchorId(experience.id)}
    class="relative mb-7 scroll-mt-24 last:mb-0"
    style={paperBandStyle(experience.accent)}
>
    <h3 class="text-lg font-medium">{experience.company}</h3>
    <p class="mb-1.5 mt-0.5 text-sm text-paper-muted">
        {experience.role} &middot; {experience.startDate} to {experience.endDate}
    </p>
    <p class="text-base font-light leading-relaxed">{experience.highlightSummary}</p>
</article>

<style>
    article::before {
        content: '';
        position: absolute;
        top: 0.15rem;
        bottom: 0.15rem;
        left: -1rem;
        width: 2px;
        border-radius: 2px;
        background-color: rgba(var(--band), 0.55);
        opacity: 0;
    }

    article:target::before {
        opacity: 1;
    }
</style>
