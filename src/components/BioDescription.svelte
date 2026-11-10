<script lang="ts">
    import Age from './Age.svelte';
    import InlineAction from './InlineAction.svelte';
    import CityMapModal from './CityMapModal.svelte';
    import OldSiteModal from './OldSiteModal.svelte';
    import { yearsOfExperience } from '$lib/identity';
    import { BIO_LINKS, BIO_OLD_SITE_ACTION, BIO_PLACES_ACTION } from '$lib/bio-links';
    import { citiesNote } from '$lib/cities';
    import { experienceAnchorId } from '$lib/experiences';
    import type { PageTone } from '$lib/paper';
    import { withSummaryOrigin } from '$lib/summary-origin';

    let className: string = 'text-sm';
    export { className as class };
    export let mode: PageTone = 'terminal';

    const JUMP_HINT = 'JUMP TO HIGHLIGHT';

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
    $: isPaper = mode === 'paper';
    // Every link that leaves the summary is marked, so the terminal can offer the way back.
    $: continuousLearningAction = {
        ...BIO_LINKS.continuousLearning,
        href: isPaper
            ? withSummaryOrigin(BIO_LINKS.continuousLearning.href)
            : BIO_LINKS.continuousLearning.href
    };
    // Paper page doesn't have a modal.
    $: yearsAction = isPaper ? { hint: '' } : { onActivate: openOldSite };
    $: placesAction = isPaper
        ? { note: citiesNote(), hint: '' }
        : { hint: 'CLICK TO OPEN MAP', onActivate: openMap };

    function workAction(id: 'amazon' | 'msd' | 'criisp') {
        const link = BIO_LINKS[id];
        return isPaper ? { ...link, href: `#${experienceAnchorId(id)}`, hint: JUMP_HINT } : link;
    }
</script>

<p class={className}>
    I'm a <Age floored={true} /> year old software engineer with
    <InlineAction
        {...yearsAction}
        target={BIO_OLD_SITE_ACTION.target}
        label={BIO_OLD_SITE_ACTION.label}
        accent={BIO_OLD_SITE_ACTION.accent}
        screenshot={BIO_OLD_SITE_ACTION.screenshot}
        tone={mode}>{yearsInExperience} years of experience</InlineAction
    >
    building and shipping production software at scale. I've lived in <InlineAction
        {...BIO_PLACES_ACTION}
        {...placesAction}
        tone={mode}>8 different cities across 3 continents</InlineAction
    >, which has given me a broad perspective on technology and problem-solving. I had
    just completed my <InlineAction {...workAction('amazon')} tone={mode}
        >placement at Amazon</InlineAction
    >, and finishing my final year at the
    University of Bath, where I studied CS + AI. Previously, I worked on
    <InlineAction {...workAction('msd')} tone={mode}>LLMOps at MSD</InlineAction> and was a
    <InlineAction {...workAction('criisp')} tone={mode}>programming research assistant for CRIISP</InlineAction> at the
    University of Bath.
</p>
<p class={className}>
    I'm deeply curious about how <InlineAction {...continuousLearningAction} tone={mode}
        >systems work from first principles</InlineAction
    >, whether that's foundational technology or bleeding-edge tooling. Understanding
    what's happening under the hood means I get far more out of AI-assisted
    development than most.
</p>

{#if !isPaper && openModal?.kind === 'map'}
    <CityMapModal restoreFocus={openModal.openedByKeyboard} onClose={closeModal} />
{/if}
{#if !isPaper && openModal?.kind === 'oldSite'}
    <OldSiteModal
        action={BIO_OLD_SITE_ACTION}
        restoreFocus={openModal.openedByKeyboard}
        onClose={closeModal}
    />
{/if}
