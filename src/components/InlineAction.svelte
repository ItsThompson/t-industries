<script lang="ts">
    import { onMount, tick } from 'svelte';

    /** Renders an anchor when set, a button otherwise. */
    export let href: string | undefined = undefined;
    export let target: string;
    export let accent: string;
    export let label: string;
    export let note: string;
    /** Trailing line of the note, describing what activation does. */
    export let hint: string = 'CLICK TO OPEN';
    export let onActivate: (() => void) | null = null;

    const TOOLTIP_GAP = 8;
    const VIEWPORT_MARGIN = 8;

    let anchorElement: HTMLElement;
    let tooltipElement: HTMLSpanElement;
    let visible = false;
    let left = 0;
    let top = 0;
    let frameRequested = false;

    $: element = href ? 'a' : 'button';
    // `svelte:element` types its attributes as generic HTML, so the tag-specific
    // attributes ride in through a spread.
    $: elementAttributes = href ? { href } : { type: 'button' };
    $: tooltipId = `bio-note-${target}`;

    async function show(): Promise<void> {
        visible = true;
        // The note must be in the layout before it can be measured.
        await tick();
        positionNote();
    }

    function hide(): void {
        visible = false;
    }

    function handleKeydown(event: KeyboardEvent): void {
        if (event.key === 'Escape') hide();
    }

    function positionNote(): void {
        if (!anchorElement || !tooltipElement) return;

        const anchorRect = anchorElement.getBoundingClientRect();

        // The note is fixed, so it cannot follow an anchor that leaves the page.
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

    function handleViewportChange(): void {
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
        window.addEventListener('scroll', handleViewportChange, true);
        window.addEventListener('resize', handleViewportChange);

        return () => {
            window.removeEventListener('scroll', handleViewportChange, true);
            window.removeEventListener('resize', handleViewportChange);
        };
    });
</script>

<!-- The element carries native semantics: an anchor when href is set, a button otherwise. -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<svelte:element
    this={element}
    bind:this={anchorElement}
    {...elementAttributes}
    role={href ? 'link' : 'button'}
    aria-describedby={tooltipId}
    class="border-b border-dotted hover:border-solid transition-colors duration-150 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2"
    style:color={accent}
    style:border-color={accent}
    style:outline-color={accent}
    on:click={() => onActivate?.()}
    on:mouseenter={show}
    on:mouseleave={hide}
    on:focus={show}
    on:blur={hide}
    on:keydown={handleKeydown}
><slot /></svelte:element><span
    bind:this={tooltipElement}
    id={tooltipId}
    role="tooltip"
    class="fixed z-50 block w-64 max-w-[calc(100vw-1rem)] border bg-black p-2 text-left pointer-events-none {visible
        ? 'visible'
        : 'invisible'}"
    style:border-color={accent}
    style:left="{left}px"
    style:top="{top}px"
>
    <span class="label-xs block mb-1" style:color={accent}>{label}</span>
    <span class="block text-xs font-mono text-secondary-100 leading-relaxed">{note}</span>
    <span class="label-xs block mt-1 text-secondary-200">{hint} &#8629;</span>
</span>
