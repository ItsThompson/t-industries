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
    import Divider from '../../components/industrial/Divider.svelte';
    import Chevrons from '../../components/industrial/Chevrons.svelte';
    import ExperienceSection from '../../components/manifest/ExperienceSection.svelte';
    import EthosSection from '../../components/manifest/EthosSection.svelte';
    import SectionNav from '../../components/manifest/SectionNav.svelte';
    import ManifestFooter from './ManifestFooter.svelte';
    import type { PageData } from './$types';

    export let data: PageData;

    const unitSerial = getUnitSerial();

    let systemTime = getSystemTime();
    let systemTimeInterval: ReturnType<typeof setInterval>;

    const RND_API_ENDPOINT =
        'https://script.google.com/macros/s/AKfycbyOG-6A1DXH_87UUl0G4zmhNbUZg8w5drdFpkJw-ZNR6E-SmvHcqHomJfStnjoqQU0ehA/exec';

    let rndList = writable<string[]>([]);
    let rndError = writable(false);

    let activeSection = '';

    const SECTION_IDS = ['identity', 'experience', 'projects', 'ethos'];

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

        // IntersectionObserver to track the currently visible section
        let observer: IntersectionObserver | undefined;

        if (typeof IntersectionObserver !== 'undefined') {
            const sectionElements = SECTION_IDS
                .map((id) => document.getElementById(id))
                .filter((el): el is HTMLElement => el !== null);

            const visibilityMap = new Map<string, number>();

            observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        visibilityMap.set(entry.target.id, entry.intersectionRatio);
                    });

                    // Pick the section closest to the top that meets threshold
                    let topSection = '';
                    let topPosition = Infinity;

                    visibilityMap.forEach((ratio, id) => {
                        if (ratio > 0) {
                            const el = document.getElementById(id);
                            if (el) {
                                const rect = el.getBoundingClientRect();
                                if (rect.top < topPosition) {
                                    topPosition = rect.top;
                                    topSection = id;
                                }
                            }
                        }
                    });

                    if (topSection) {
                        activeSection = topSection;
                    }
                },
                { threshold: [0, 0.3, 0.6, 1.0] }
            );

            sectionElements.forEach((el) => observer!.observe(el));
        }

        return () => {
            clearInterval(systemTimeInterval);
            observer?.disconnect();
        };
    });
</script>

<svelte:head>
    <title>MANIFEST // Thompson Industries</title>
</svelte:head>

<div class="w-full max-w-5xl px-4">
    <!-- Section Navigation -->
    <SectionNav {activeSection} />

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

    <!-- ═══════ PROJECTS SECTION ═══════ -->
    <section id="projects" class="mt-12">
        <Divider label="PROJECTS" />

        <div class="my-4 text-center">
            <Chevrons count={4} color="accent" />
            <span class="text-secondary-200 font-mono mx-2">────</span>
            <span class="text-secondary-200 font-mono">PROJECTS</span>
            <span class="text-secondary-200 font-mono mx-2">────</span>
            <Chevrons count={4} color="accent" />
        </div>

        <SectionHeading level={2} text="PINNED REPOSITORIES" />

        {#if data.projectsError && data.projects.length === 0}
            <div class="mt-6">
                <Compartment>
                    <p class="text-secondary-200 font-mono text-sm text-center">
                        Unable to load projects
                    </p>
                </Compartment>
            </div>
        {:else}
            <div class="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {#each data.projects as project}
                    <Compartment>
                        <div class="space-y-2">
                            <a
                                href={project.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="display-md text-white hover:text-primary transition-colors"
                            >
                                {project.name}
                            </a>
                            {#if project.description}
                                <p class="text-sm font-mono text-secondary-100 leading-relaxed">
                                    {project.description}
                                </p>
                            {/if}
                            {#if project.primaryLanguage}
                                <div class="flex items-center gap-2 pt-2">
                                    <span
                                        class="inline-block w-3 h-3 rounded-full"
                                        style="background-color: {project.primaryLanguage.color}"
                                    ></span>
                                    <span class="label-sm text-secondary-200">
                                        {project.primaryLanguage.name}
                                    </span>
                                </div>
                            {/if}
                        </div>
                    </Compartment>
                {/each}
            </div>
        {/if}

        <div class="mt-6">
            <MetadataBar position="bottom">
                <span>PINNED: {data.projects.length} // SOURCE: github.com/ItsThompson</span>
            </MetadataBar>
        </div>
    </section>
    <!-- ═══════ END PROJECTS SECTION ═══════ -->

    <!-- ═══════ ETHOS SECTION ═══════ -->
    <div class="mt-12">
        <EthosSection />
    </div>
    <!-- ═══════ END ETHOS SECTION ═══════ -->

    <!-- ═══════ PAGE FOOTER ═══════ -->
    <ManifestFooter />
    <!-- ═══════ END PAGE FOOTER ═══════ -->
</div>
