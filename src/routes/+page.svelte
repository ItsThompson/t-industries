<script lang="ts">
    import Age from '../components/Age.svelte';
    import Link from '../components/Link.svelte';
    import Compartment from '../components/industrial/Compartment.svelte';
    import SectionHeading from '../components/industrial/SectionHeading.svelte';
    import MetadataBar from '../components/industrial/MetadataBar.svelte';
    import BioDescription from '../components/BioDescription.svelte';
    import RndList from '../components/RndList.svelte';
    import { identity } from '$lib/identity';
    import { getUptime, getExperienceCycles, getSystemTime } from '$lib/terminal-display';
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

<div class="w-full max-w-5xl px-4">
    <MetadataBar position="top">
        <span>{identity.unitSerial}</span>
        <span>STATUS: ACTIVE</span>
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
                    <h3 class="text-lg font-bold text-white">{BIO_NAME}</h3>
                    <p class="text-sm font-mono text-secondary-100">
                        {BIO_TITLE}
                    </p>
                    <BioDescription class="text-sm font-mono text-secondary-100 leading-relaxed" />
                    <p class="label-xs text-secondary-200 pt-2">
                        AGE: <Age /> YRS
                    </p>
                </div>
            </Compartment>
        </div>

        <!-- Sidebar: STATUS + CONNECTIONS stacked, span 4 -->
        <div class="col-span-12 md:col-span-4 flex flex-col gap-4">
            <Compartment title="STATUS">
                <div class="space-y-3">
                    <p class="text-sm font-mono text-white">
                        <span class="text-primary">●</span> ACTIVE
                    </p>
                    <p class="label-sm text-secondary-200">
                        UPTIME: {getUptime()}
                    </p>
                    <p class="label-sm text-secondary-200">
                        {getExperienceCycles()}
                    </p>
                    <p class="label-sm text-secondary-200">
                        LOC: LON
                    </p>
                </div>
            </Compartment>

            <Compartment title="CONNECTIONS">
                <div class="space-y-3">
                    {#each SOCIAL_LINKS as link}
                        <div>
                            <Link href={link.href} name={link.name} />
                        </div>
                    {/each}
                </div>
            </Compartment>
        </div>

        <!-- R&D: full width -->
        <div class="col-span-12">
            <Compartment title="CURRENT R&D OPS">
                <RndList />
            </Compartment>
        </div>
    </div>
</div>
