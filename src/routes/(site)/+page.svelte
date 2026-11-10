<script lang="ts">
    import { base } from '$app/paths';
    import Age from '../../components/Age.svelte';
    import Link from '../../components/Link.svelte';
    import Compartment from '../../components/industrial/Compartment.svelte';
    import SectionHeading from '../../components/industrial/SectionHeading.svelte';
    import MetadataBar from '../../components/industrial/MetadataBar.svelte';
    import BioDescription from '../../components/BioDescription.svelte';
    import RndList from '../../components/RndList.svelte';
    import Seo from '../../components/Seo.svelte';
    import { getSystemTime } from '$lib/terminal-display';
    import { BIO_NAME, BIO_TITLE, SOCIAL_LINKS } from '$lib/bio';
    import { onMount } from 'svelte';

    let systemTime = getSystemTime();

    onMount(() => {
        const systemTimeInterval = setInterval(() => {
            systemTime = getSystemTime();
        }, 1000);

        return () => clearInterval(systemTimeInterval);
    });
</script>

<Seo
    title="Thompson Tong | Software Engineer"
    description="Thompson Tong is a software engineer and CS + AI student at the University of Bath. Experience at Amazon, MSD, and the CRIISP research group."
    profilePage
/>

<MetadataBar position="top">
    <span>{systemTime}</span>
</MetadataBar>

<div class="mt-4 mb-6">
    <SectionHeading level={2} text="IDENTITY" />
</div>

<div class="grid grid-cols-12 gap-4">
    <!-- Bio: span 8 on desktop, full width on mobile -->
    <div class="col-span-12 md:col-span-8">
        <Compartment title="BIO">
            <div class="space-y-3">
                <h1 class="text-lg font-bold text-white">{BIO_NAME}</h1>
                <p class="text-sm font-mono text-secondary-100">
                    {BIO_TITLE}
                </p>
                <BioDescription class="text-sm font-mono text-secondary-100 leading-relaxed" />
                <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 pt-2">
                    <p class="label-xs text-secondary-200">AGE: <Age /> YRS</p>
                    <!-- The paper build has no nav of its own, so it hangs off this line. -->
                    <a
                        href="{base}/one-pager"
                        aria-label="Alter ego: open the one-pager"
                        class="label-xs text-primary transition-colors duration-150 hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        >ALTER EGO &#8594;</a
                    >
                </div>
            </div>
        </Compartment>
    </div>

    <!-- Sidebar: CONNECTIONS + R&D stacked, span 4 -->
    <div class="col-span-12 md:col-span-4 flex flex-col gap-4">
        <Compartment title="CONNECTIONS">
            <div class="space-y-3">
                {#each SOCIAL_LINKS as link}
                    <div>
                        <Link href={link.href} name={link.name} />
                    </div>
                {/each}
            </div>
        </Compartment>

        <Compartment title="CURRENT INTEREST">
            <RndList />
        </Compartment>
    </div>
</div>
