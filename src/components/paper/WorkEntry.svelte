<script lang="ts">
    import { experienceAnchorId, type HighlightedExperience } from '$lib/experiences';
    import { paperBandStyle } from '$lib/paper';

    export let experience: HighlightedExperience;
    export let marked = false;
</script>

<article
    id={experienceAnchorId(experience.id)}
    tabindex="-1"
    class="relative mb-7 scroll-mt-24 last:mb-0"
    class:marked
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
        transition: opacity 200ms;
    }

    /* Driven from a class rather than :target: a fallback jump or deep link
       sets the hash, and :target would re-show this line under an arrow drawn
       later. */
    article.marked::before {
        opacity: 1;
    }
</style>
