<script lang="ts">
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import Age from '../../components/Age.svelte';
    import Link from '../../components/Link.svelte';
    import Loading from '../../components/Loading.svelte';
    import Compartment from '../../components/industrial/Compartment.svelte';
    import SectionHeading from '../../components/industrial/SectionHeading.svelte';
    import MetadataBar from '../../components/industrial/MetadataBar.svelte';
    import {
        getUnitSerial,
        getUptime,
        getExperienceCycles,
        getSystemTime
    } from '$lib/metadata';
    import ExperienceSection from '../../components/manifest/ExperienceSection.svelte';
    import EthosSection from './EthosSection.svelte';
    import ManifestFooter from './ManifestFooter.svelte';

    const unitSerial = getUnitSerial();

    let systemTime = getSystemTime();
    let systemTimeInterval: ReturnType<typeof setInterval>;

    const RND_API_ENDPOINT =
        'https://script.google.com/macros/s/AKfycbyOG-6A1DXH_87UUl0G4zmhNbUZg8w5drdFpkJw-ZNR6E-SmvHcqHomJfStnjoqQU0ehA/exec';

    let rndList = writable<string[]>([]);
    let rndError = writable(false);

    onMount(() => {
        fetch(RND_API_ENDPOINT)
            .then((response) => response.json())
            .then((data) => {
                rndList.set(data);
            })
            .catch((error) => {
                console.error('Failed to fetch R&D list:', error);
                rndError.set(true);
            });

        systemTimeInterval = setInterval(() => {
            systemTime = getSystemTime();
        }, 1000);

        return () => {
            clearInterval(systemTimeInterval);
        };
    });
</script>

<svelte:head>
    <title>MANIFEST // Thompson Industries</title>
</svelte:head>

<div class="w-full max-w-5xl px-4">
    <!-- ═══════ IDENTITY SECTION ═══════ -->
    <section id="identity">
        <MetadataBar position="top">
            <span>{unitSerial}</span>
            <span>STATUS: ACTIVE</span>
            <span>{systemTime}</span>
        </MetadataBar>

        <div class="mt-4 mb-6">
            <SectionHeading level={2} text="IDENTITY" prefix=">>>>" />
        </div>

        <div class="grid grid-cols-12 gap-4">
            <!-- Bio compartment: span 6 on desktop, full width on mobile -->
            <div class="col-span-12 md:col-span-6">
                <Compartment title="BIO">
                    <div class="space-y-3">
                        <h3 class="text-lg font-bold text-white">Thompson Tong</h3>
                        <p class="text-sm font-mono text-secondary-100">
                            Software Engineer + Student
                        </p>
                        <p class="text-sm font-mono text-secondary-100 leading-relaxed">
                            Hi, I am Thompson, a <Age floored={true} /> year old software engineer
                            with a passion for building scalable web applications and exploring
                            emerging technologies. Currently on placement at Amazon, previously
                            building GenAI pipelines at MSD and research software at the
                            University of Bath. I have lived in 7 different cities across
                            3 continents, bringing a multicultural perspective to every team
                            I work on.
                        </p>
                        <p class="label-xs text-secondary-200 pt-2">
                            AGE: <Age /> YRS
                        </p>
                    </div>
                </Compartment>
            </div>

            <!-- Status compartment: span 3 on desktop, full width on mobile -->
            <div class="col-span-12 md:col-span-3">
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
            </div>

            <!-- Connections compartment: span 3 on desktop, full width on mobile -->
            <div class="col-span-12 md:col-span-3">
                <Compartment title="CONNECTIONS">
                    <div class="space-y-3">
                        <div>
                            <Link href="https://github.com/ItsThompson" name="GitHub" />
                        </div>
                        <div>
                            <Link href="https://linkedin.com/in/thompsontong" name="LinkedIn" />
                        </div>
                    </div>
                </Compartment>
            </div>

            <!-- R&D compartment: full width -->
            <div class="col-span-12">
                <Compartment title="CURRENT R&D OPS">
                    {#if $rndError}
                        <p class="text-sm font-mono text-secondary-200">
                            R&D data unavailable.
                        </p>
                    {:else if $rndList.length > 0}
                        <ul class="space-y-1">
                            {#each $rndList as item}
                                <li class="text-sm font-mono text-secondary-100">
                                    <span class="text-primary mr-2">▸</span>{item}
                                </li>
                            {/each}
                        </ul>
                    {:else}
                        <div class="text-center py-4">
                            <Loading />
                        </div>
                    {/if}
                </Compartment>
            </div>
        </div>
    </section>
    <!-- ═══════ END IDENTITY SECTION ═══════ -->

    <!-- ═══════ EXPERIENCE SECTION ═══════ -->
    <div class="mt-12">
        <ExperienceSection />
    </div>
    <!-- ═══════ END EXPERIENCE SECTION ═══════ -->

    <!-- ═══════ ETHOS SECTION ═══════ -->
    <EthosSection />
    <!-- ═══════ END ETHOS SECTION ═══════ -->

    <!-- ═══════ PAGE FOOTER ═══════ -->
    <ManifestFooter />
    <!-- ═══════ END PAGE FOOTER ═══════ -->
</div>
