<script lang="ts">
    import type { PageTone } from '$lib/paper';
    import { cardAppearanceFor } from './appearance';
    import type { NoteCard } from './types';

    export let card: NoteCard;
    export let tone: PageTone = 'terminal';
    export let accent: string;
    export let id: string;
    /* Drives the return symbol, which only a phrase that opens something earns. */
    export let activatable: boolean;
    export let open: boolean;
    export let left: number;
    export let top: number;

    let root: HTMLElement;

    $: appearance = cardAppearanceFor(tone, { accent });
    $: classes = `${appearance.classes} ${open ? 'visible' : 'invisible'}`;

    /** The card reports its own size, so placement stays out of this component. */
    export function measure(): DOMRect {
        return root.getBoundingClientRect();
    }
</script>

<span
    bind:this={root}
    {id}
    role="tooltip"
    class={classes}
    style={appearance.style}
    style:left="{left}px"
    style:top="{top}px"
>
    <span class={appearance.labelClasses} style={appearance.labelStyle}>{card.label}</span>
    <!-- Rendered only while open so the image is never fetched on page load. -->
    {#if card.media && open}
        <img
            src={card.media.staticAssetPathWithDeployBase}
            alt={card.media.alt}
            width={card.media.intrinsicPixelWidth}
            height={card.media.intrinsicPixelHeight}
            decoding="async"
            class="mb-1 block w-full"
        />
    {/if}
    {#if card.note}
        <span class={appearance.noteClasses}>{card.note}</span>
    {/if}
    {#if card.hint}
        <span class={appearance.hintClasses}>{card.hint}{#if activatable} &#8629;{/if}</span>
    {/if}
</span>
