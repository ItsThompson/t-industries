<script lang="ts">
    import { base } from '$app/paths';
    import { SOCIAL_LINKS } from '$lib/bio';

    const MARKS = {
        github: `${base}/github.svg`,
        linkedin: `${base}/linkedin.svg`
    };
</script>

<div class="mt-12 flex items-center gap-5">
    {#each SOCIAL_LINKS as link}
        <!-- The mark is decorative, so the link carries the only accessible name. -->
        <a
            href={link.href}
            aria-label={link.name}
            target="_blank"
            rel="noopener noreferrer"
            class="block transition-opacity duration-150 hover:opacity-[0.55] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-paper-ink"
        >
            <img src={MARKS[link.logo]} alt="" class="block h-5 w-auto" />
        </a>
    {/each}
</div>
