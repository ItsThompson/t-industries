<script lang="ts">
    import { base } from '$app/paths';
    import BioDescription from '../../components/BioDescription.svelte';
    import InlineAction from '../../components/InlineAction.svelte';
    import Seo from '../../components/Seo.svelte';
    import BandLink from '../../components/paper/BandLink.svelte';
    import SocialRow from '../../components/paper/SocialRow.svelte';
    import WorkEntry from '../../components/paper/WorkEntry.svelte';
    import { ACCENTS } from '$lib/accents';
    import { highlightHref } from '$lib/deep-links';
    import { ETHOS_ITEMS } from '$lib/ethos';
    import { highlights } from '$lib/experiences';
    import { PAPER_GRAIN_OPACITY } from '$lib/paper';

    /** Adds the comma and the "and" that turn the three titles into one sentence. */
    function separatorAfter(index: number): string {
        const last = ETHOS_ITEMS.length - 1;

        if (index === last) return '';
        return index === last - 1 ? ', and ' : ', ';
    }
</script>

<Seo
    title="One-pager | Thompson Tong"
    description="A single page version of Thompson Tong's site: the bio, three work highlights, and the three principles behind the work."
/>

<svelte:head>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
    <link
        href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&display=swap"
        rel="stylesheet"
    />
    <!-- Painted before hydration, so a prerendered page never flashes the black site.
         The color is the paper palette value; the page test holds the two together. -->
    <style>
        body {
            background-color: #F4EFE2;
        }
    </style>
</svelte:head>

<div class="relative min-h-dvh bg-paper-base font-outfit text-paper-ink">
    <div
        aria-hidden="true"
        class="pointer-events-none fixed inset-0 mix-blend-multiply"
        style:background-image="url({base}/grain.svg)"
        style:opacity={PAPER_GRAIN_OPACITY}
    ></div>

    <div class="relative mx-auto max-w-6xl px-6 py-16 md:py-24">
        <h1 class="mb-8 text-4xl font-medium leading-tight tracking-[-0.012em]">
            <span class="font-normal text-paper-muted">Hi, my name is</span>
            <InlineAction
                target="index"
                accent={ACCENTS.primary}
                label="Thompson Tong / Index"
                note="Go to full site."
                href="{base}/"
                tone="paper">Thompson Tong</InlineAction
            >
        </h1>

        <div class="space-y-4">
            <BioDescription mode="paper" class="text-[1.1875rem] font-light leading-[1.65]" />
        </div>

        <section>
            <h2
                class="mb-4 mt-12 text-[10px] font-semibold uppercase tracking-[0.14em] text-paper-muted"
            >
                Work
            </h2>
            {#each highlights() as experience}
                <WorkEntry {experience} />
            {/each}
            <a
                href="{base}/experience"
                class="mt-2 inline-block border-b-2 border-primary/55 pb-px text-[0.9375rem] font-medium transition-colors duration-150 hover:border-primary focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-paper-ink"
                >View all experience</a
            >
        </section>

        <section>
            <h2
                class="mb-4 mt-12 text-[10px] font-semibold uppercase tracking-[0.14em] text-paper-muted"
            >
                Ethos
            </h2>
            <p class="text-[1.1875rem] font-light leading-[1.65]">
                My objective function optimizes for
                {#each ETHOS_ITEMS as item, index}<BandLink
                        href={highlightHref('/ethos', item.id)}
                        accent={ACCENTS.primary}>{item.title.toLowerCase()}</BandLink
                    >{separatorAfter(index)}{/each}.
            </p>
        </section>

        <SocialRow />
    </div>
</div>
