<script lang="ts">
    import Age from './Age.svelte';
    import { InlinePhrase } from './inline-phrase';
    import CityMapModal from './CityMapModal.svelte';
    import OldSiteModal from './OldSiteModal.svelte';
    import { bioActionsFor, type BioWorkId } from './bio-actions';
    import { yearsOfExperience } from '$lib/identity';
    import { BIO_OLD_SITE_ACTION } from '$lib/bio-links';
    import type { PageMode } from '$lib/paper';

    let className: string = 'text-sm';
    export { className as class };
    export let mode: PageMode = 'terminal';
    export let onJumpToWork:
        | ((id: BioWorkId, trigger: HTMLElement, event: MouseEvent) => void)
        | null = null;

    let openModal: { kind: 'map' | 'oldSite'; openedByKeyboard: boolean } | null = null;

    // A click with detail 0 comes from Enter or Space, so focus belongs on the
    // trigger after closing. A pointer click should leave no focus behind.
    function openMap(event: MouseEvent): void {
        openModal = { kind: 'map', openedByKeyboard: event.detail === 0 };
    }

    function openOldSite(event: MouseEvent): void {
        openModal = { kind: 'oldSite', openedByKeyboard: event.detail === 0 };
    }

    function closeModal(): void {
        openModal = null;
    }

    $: yearsInExperience = yearsOfExperience();
    $: actions = bioActionsFor(mode, {
        openMap,
        openOldSite,
        jumpToWork: onJumpToWork ?? undefined,
    });
</script>

<p class={className}>
    I'm a <Age floored={true} /> year old software engineer with
    <InlinePhrase action={actions.years} {mode}>{yearsInExperience} years of experience</InlinePhrase
    >
    building and shipping production software at scale. I've lived in <InlinePhrase
        action={actions.places}
        {mode}>8 different cities across 3 continents</InlinePhrase
    >, which has given me a broad perspective on technology and problem-solving. I had
    just completed my <InlinePhrase action={actions.work('amazon')} {mode}
        >placement at Amazon</InlinePhrase
    >, and finishing my final year at the
    University of Bath, where I studied CS + AI. Previously, I worked on
    <InlinePhrase action={actions.work('msd')} {mode}>LLMOps at MSD</InlinePhrase> and was a
    <InlinePhrase action={actions.work('criisp')} {mode}>programming research assistant for CRIISP</InlinePhrase> at the
    University of Bath.
</p>
<p class={className}>
    I'm deeply curious about how <InlinePhrase action={actions.continuousLearning} {mode}
        >systems work from first principles</InlinePhrase
    >, whether that's foundational technology or bleeding-edge tooling. Understanding
    what's happening under the hood means I get far more out of AI-assisted
    development than most.
</p>

{#if openModal?.kind === 'map'}
    <CityMapModal restoreFocus={openModal.openedByKeyboard} onClose={closeModal} />
{/if}
{#if openModal?.kind === 'oldSite'}
    <OldSiteModal
        action={BIO_OLD_SITE_ACTION}
        restoreFocus={openModal.openedByKeyboard}
        onClose={closeModal}
    />
{/if}
