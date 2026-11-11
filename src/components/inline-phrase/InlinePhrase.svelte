<script lang="ts">
    import { onMount, tick } from 'svelte';
    import type { PageMode } from '$lib/paper';
    import { triggerAppearanceFor } from './appearance';
    import NoteCardView from './NoteCardView.svelte';
    import { isOffscreen, pickLine, placeCard, type Point, type Rect } from './placement';
    import { triggerFor } from './trigger';
    import type { PhraseAction } from './types';

    const GAP = 8;
    const MARGIN = 8;

    export let action: PhraseAction;
    export let mode: PageMode = 'terminal';

    let triggerElement: HTMLElement;
    let cardView: NoteCardView;
    let open = false;
    let left = 0;
    let top = 0;
    let pointer: Point | null = null;
    let frameRequested = false;

    $: trigger = triggerFor(action);
    $: appearance = triggerAppearanceFor(mode, { accent: action.accent, kind: action.kind });
    $: card = action.card ?? null;
    $: cardId = `bio-note-${action.target}`;
    $: activatable = action.kind !== 'describe';
    $: activate = action.kind === 'describe' ? null : (action.onActivate ?? null);

    async function show(): Promise<void> {
        if (!card) return;

        open = true;
        // The card must be in the layout before it can be measured.
        await tick();
        positionCard();
    }

    function handlePointerEnter(event: MouseEvent): void {
        if (!card) return;

        pointer = { x: event.clientX, y: event.clientY };
        show();
    }

    function handlePointerMove(event: MouseEvent): void {
        if (!open) return;

        pointer = { x: event.clientX, y: event.clientY };
        schedulePosition();
    }

    function handleFocus(): void {
        pointer = null;
        show();
    }

    function hide(): void {
        open = false;
    }

    function handleClick(event: MouseEvent): void {
        activate?.(event, triggerElement);
    }

    function handleKeydown(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            hide();
            return;
        }

        if (action.kind !== 'activate') return;
        if (event.key !== 'Enter' && event.key !== ' ') return;

        event.preventDefault();
        // detail 0 marks a keyboard activation, matching the click an anchor gets
        // from Enter, so the caller can decide whether to restore focus.
        activate?.(new MouseEvent('click', { detail: 0 }), triggerElement);
    }

    function positionCard(): void {
        if (!triggerElement || !cardView) return;

        const anchor = anchorRect();

        if (isOffscreen(anchor, window.innerHeight)) {
            hide();
            return;
        }

        const placed = placeCard({
            anchor,
            card: cardView.measure(),
            viewport: { width: window.innerWidth, height: window.innerHeight },
            gap: GAP,
            margin: MARGIN,
        });

        left = placed.left;
        top = placed.top;
    }

    function anchorRect(): Rect {
        const lines = Array.from(triggerElement.getClientRects());
        return pickLine(lines, pointer) ?? triggerElement.getBoundingClientRect();
    }

    function schedulePosition(): void {
        if (!open || frameRequested) return;

        frameRequested = true;
        requestAnimationFrame(() => {
            frameRequested = false;
            positionCard();
        });
    }

    onMount(() => {
        window.addEventListener('scroll', schedulePosition, true);
        window.addEventListener('resize', schedulePosition);

        return () => {
            window.removeEventListener('scroll', schedulePosition, true);
            window.removeEventListener('resize', schedulePosition);
        };
    });
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<svelte:element
    this={trigger.element}
    bind:this={triggerElement}
    {...trigger.attributes}
    role={trigger.role}
    aria-describedby={card ? cardId : undefined}
    class={appearance.classes}
    style={appearance.style}
    on:click={handleClick}
    on:mouseenter={handlePointerEnter}
    on:mousemove={handlePointerMove}
    on:mouseleave={hide}
    on:focus={handleFocus}
    on:blur={hide}
    on:keydown={handleKeydown}
><slot /></svelte:element>{#if card}<NoteCardView
        bind:this={cardView}
        id={cardId}
        {card}
        {mode}
        accent={action.accent}
        {activatable}
        {open}
        {left}
        {top}
    />{/if}
