<script lang="ts">
    import { onMount, tick } from 'svelte';
    import type { NoteScreenshot } from '$lib/bio-links';
    import type { PageTone } from '$lib/paper';
    import { appearanceFor } from './inline-action-appearance';

    export let href: string | undefined = undefined;
    export let target: string;
    export let accent: string;
    export let label: string;
    export let note: string | undefined = undefined;
    export let hint: string = 'CLICK TO OPEN';
    export let onActivate: ((event: MouseEvent) => void) | null = null;
    export let screenshot: NoteScreenshot | null = null;
    export let tone: PageTone = 'terminal';

    const TOOLTIP_GAP = 8;
    const VIEWPORT_MARGIN = 8;

    let anchorElement: HTMLElement;
    let tooltipElement: HTMLSpanElement;
    let visible = false;
    let left = 0;
    let top = 0;
    let frameRequested = false;
    let pointer: { x: number; y: number } | null = null;

    /** The trigger is an anchor when it has a destination, a span when it acts in place. */
    interface Trigger {
        element: 'a' | 'span';
        attributes: { href: string } | { tabindex: number };
        role: 'link' | 'button' | undefined;
    }

    function triggerFor(
        destination: string | undefined,
        action: ((event: MouseEvent) => void) | null
    ): Trigger {
        if (destination) {
            return { element: 'a', attributes: { href: destination }, role: 'link' };
        }

        return { element: 'span', attributes: { tabindex: 0 }, role: action ? 'button' : undefined };
    }

    $: isLink = Boolean(href);
    $: isActivatable = isLink || onActivate !== null;
    $: trigger = triggerFor(href, onActivate);
    $: tooltipId = `bio-note-${target}`;
    $: appearance = appearanceFor(tone, { accent, isActivatable });
    $: tooltipClasses = `${appearance.tooltipClasses} ${visible ? 'visible' : 'invisible'}`;

    async function show(): Promise<void> {
        visible = true;
        // The note must be in the layout before it can be measured.
        await tick();
        positionNote();
    }

    function handlePointerEnter(event: MouseEvent): void {
        pointer = { x: event.clientX, y: event.clientY };
        show();
    }

    function handlePointerMove(event: MouseEvent): void {
        if (!visible) return;

        pointer = { x: event.clientX, y: event.clientY };
        schedulePosition();
    }

    function handleFocus(): void {
        pointer = null;
        show();
    }

    function hide(): void {
        visible = false;
    }

    function handleClick(event: MouseEvent): void {
        onActivate?.(event);
    }

    function handleKeydown(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            hide();
            return;
        }

        if (event.key !== 'Enter' && event.key !== ' ') return;
        if (isLink || !onActivate) return;

        event.preventDefault();
        // detail 0 marks a keyboard activation, matching the click an anchor gets
        // from Enter, so the caller can decide whether to restore focus.
        onActivate(new MouseEvent('click', { detail: 0 }));
    }

    function positionNote(): void {
        if (!anchorElement || !tooltipElement) return;

        const anchorRect = rectForPointer();

        if (anchorRect.bottom < 0 || anchorRect.top > window.innerHeight) {
            hide();
            return;
        }

        const noteRect = tooltipElement.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const maxLeft = Math.max(VIEWPORT_MARGIN, viewportWidth - noteRect.width - VIEWPORT_MARGIN);
        const centered = anchorRect.left + anchorRect.width / 2 - noteRect.width / 2;

        left = Math.max(VIEWPORT_MARGIN, Math.min(centered, maxLeft));

        const aboveTop = anchorRect.top - noteRect.height - TOOLTIP_GAP;
        top = aboveTop < VIEWPORT_MARGIN ? anchorRect.bottom + TOOLTIP_GAP : aboveTop;
    }

    /**
     * An action that wraps has one rect per line, and the union of them spans the
     * whole paragraph, so centring on it drops the note somewhere unrelated. Pick
     * the line the reader points at, or the last one when the pointer is past it.
     */
    function rectForPointer(): DOMRect {
        const rects = Array.from(anchorElement.getClientRects()).filter(
            (rect) => rect.width > 0 || rect.height > 0
        );

        if (rects.length === 0) return anchorElement.getBoundingClientRect();

        const at = pointer;
        if (!at) return rects[0];

        const under = rects.find(
            (rect) =>
                at.x >= rect.left &&
                at.x <= rect.right &&
                at.y >= rect.top &&
                at.y <= rect.bottom
        );
        if (under) return under;

        return rects.reduce((nearest, rect) =>
            distanceTo(rect, at) < distanceTo(nearest, at) ? rect : nearest
        );
    }

    function distanceTo(rect: DOMRect, point: { x: number; y: number }): number {
        const x = point.x - (rect.left + rect.width / 2);
        const y = point.y - (rect.top + rect.height / 2);
        return x * x + y * y;
    }

    function schedulePosition(): void {
        if (!visible || frameRequested) return;

        frameRequested = true;
        requestAnimationFrame(() => {
            frameRequested = false;
            positionNote();
        });
    }

    onMount(() => {
        // Focusing a link can scroll the page, so the note follows the anchor
        // instead of closing on every scroll event.
        window.addEventListener('scroll', schedulePosition, true);
        window.addEventListener('resize', schedulePosition);

        return () => {
            window.removeEventListener('scroll', schedulePosition, true);
            window.removeEventListener('resize', schedulePosition);
        };
    });
</script>

<!-- The element carries native semantics: an anchor when href is set, a button otherwise. -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<svelte:element
    this={trigger.element}
    bind:this={anchorElement}
    {...trigger.attributes}
    role={trigger.role}
    aria-describedby={tooltipId}
    class={appearance.triggerClasses}
    style={appearance.triggerStyle}
    on:click={handleClick}
    on:mouseenter={handlePointerEnter}
    on:mousemove={handlePointerMove}
    on:mouseleave={hide}
    on:focus={handleFocus}
    on:blur={hide}
    on:keydown={handleKeydown}
><slot /></svelte:element><span
    bind:this={tooltipElement}
    id={tooltipId}
    role="tooltip"
    class={tooltipClasses}
    style={appearance.tooltipStyle}
    style:left="{left}px"
    style:top="{top}px"
>
    <span class={appearance.labelClasses} style={appearance.labelStyle}>{label}</span>
    <!-- Rendered only while open so the image is never fetched on page load. -->
    {#if screenshot && visible}
        <img
            src={screenshot.staticAssetPathWithDeployBase}
            alt={screenshot.alt}
            width={screenshot.intrinsicPixelWidth}
            height={screenshot.intrinsicPixelHeight}
            decoding="async"
            class="mb-1 block w-full"
        />
    {/if}
    {#if note}
        <span class={appearance.noteClasses}>{note}</span>
    {/if}
    {#if hint}
        <span class={appearance.hintClasses}>{hint}{#if isActivatable} &#8629;{/if}</span>
    {/if}
</span>
