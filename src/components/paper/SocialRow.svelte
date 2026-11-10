<script lang="ts">
    import { SOCIAL_LINKS } from '$lib/bio';
</script>

<div class="mt-12 flex items-center gap-5">
    {#each SOCIAL_LINKS as link}
        <a
            href={link.href}
            aria-label={link.name}
            target="_blank"
            rel="noopener noreferrer"
            class="block transition-opacity duration-150 hover:opacity-[0.55] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-paper-ink"
        >
            <img src={link.markSrc} alt="" class="block h-5 w-auto" />
        </a>
    {/each}
</div>
