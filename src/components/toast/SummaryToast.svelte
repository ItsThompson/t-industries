<script lang="ts">
    import { base } from '$app/paths';
    import { summaryHref } from '$lib/summary-origin';
    import { OUTFIT_STYLESHEET_HREF } from '$lib/fonts';

    export let onDismiss: () => void;

    const LABEL = 'YOU ARE IN THE TERMINAL.';
    const ACTION = 'RETURN TO SUMMARY';
    const DISMISS_LABEL = 'Dismiss notice';
</script>

<svelte:head>
    <link rel="stylesheet" href={OUTFIT_STYLESHEET_HREF} />
</svelte:head>

<!-- Deliberately paper, down to the tape: the point is that it does not belong here. -->
<div
    class="relative w-full bg-paper-base px-4 pb-4 pt-5 font-outfit text-paper-ink shadow-[0_20px_40px_-12px_rgba(0,0,0,0.9)] md:-rotate-1"
>
    <img
        src="{base}/tape.svg"
        alt=""
        aria-hidden="true"
        class="absolute left-1/2 top-0 w-16 -translate-x-1/2 -translate-y-1/2 -rotate-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]"
    />

    <button
        type="button"
        aria-label={DISMISS_LABEL}
        on:click={onDismiss}
        class="absolute right-1 top-1 px-2 py-1 text-lg leading-none text-paper-muted transition-colors duration-150 hover:text-paper-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-paper-ink"
    >
        &times;
    </button>

    <p class="pr-8 text-[10px] font-semibold uppercase tracking-[0.14em] text-paper-muted">
        {LABEL}
    </p>

    <a
        href={summaryHref()}
        on:click={onDismiss}
        class="mt-3 inline-block border-b-2 border-primary/55 pb-px text-[0.9375rem] font-medium transition-colors duration-150 hover:border-primary focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-paper-ink"
    >
        {ACTION}
    </a>
</div>
