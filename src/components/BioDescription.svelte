<script lang="ts">
    import Age from './Age.svelte';
    import InlineAction from './InlineAction.svelte';
    import CityMapModal from './CityMapModal.svelte';
    import OldSiteModal from './OldSiteModal.svelte';
    import { yearsOfExperience } from '$lib/identity';
    import { BIO_LINKS, BIO_OLD_SITE_ACTION, BIO_PLACES_ACTION } from '$lib/bio-links';

    let className: string = 'text-sm';
    export { className as class };

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
</script>

<p class={className}>
    Hi, I'm Thompson, a <Age floored={true} /> year old software engineer with
    <InlineAction
        target={BIO_OLD_SITE_ACTION.target}
        label={BIO_OLD_SITE_ACTION.label}
        accent={BIO_OLD_SITE_ACTION.accent}
        screenshot={BIO_OLD_SITE_ACTION.screenshot}
        onActivate={openOldSite}>{yearsInExperience} years of experience</InlineAction
    >
    building and shipping production software at scale. I've lived in <InlineAction
        {...BIO_PLACES_ACTION}
        hint="CLICK TO OPEN MAP"
        onActivate={openMap}>8 different cities across 3 continents</InlineAction
    >, which has given me a broad perspective on technology and problem-solving. I had
    just completed my <InlineAction {...BIO_LINKS.amazon}>placement at Amazon</InlineAction>, and finishing my final year at the
    University of Bath, where I studied CS + AI. Previously, I worked on
    <InlineAction {...BIO_LINKS.msd}>LLMOps at MSD</InlineAction> and was a
    <InlineAction {...BIO_LINKS.criisp}>programming research assistant for CRIISP</InlineAction> at the
    University of Bath.
</p>
<p class={className}>
    I'm deeply curious about how <InlineAction {...BIO_LINKS.continuousLearning}
        >systems work from first principles</InlineAction
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
