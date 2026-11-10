<script context="module" lang="ts">
    export interface ArrowRequest {
        trigger: HTMLElement;
        entry: HTMLElement;
        accent: string;
        /** Pointer position in client coordinates, or null for a keyboard activation. */
        pointer: { x: number; y: number } | null;
        keyboard: boolean;
    }
</script>

<script lang="ts">
    import { onDestroy } from 'svelte';
    import {
        ARROW_EDGE_MARGIN_PX,
        DEFAULT_MIN_TURN_RADIUS,
        ENTRY_INSET_PX,
        FADE_OUT_MS,
        FLIGHT_BASE_MS,
        FLIGHT_MAX_MS,
        FLIGHT_MIN_MS,
        FLIGHT_REFERENCE_LENGTH_PX,
        PHRASE_PADDING_PX,
        arrowHeadPath,
        buildArrowPath,
        endTangent,
        pathData,
        pickFamily,
    } from '$lib/paper-arrow';
    import type { Point } from '$lib/paper-arrow';
    import { prefersReducedMotion } from '$lib/motion-preference';
    import { paperBandColor } from '$lib/paper';
    import { WIDE_VIEWPORT_MIN_WIDTH_PX } from '$lib/viewport';

    const STROKE_WIDTH_PX = 2.25;
    const HEAD_FADE_SHARE = 0.12;

    export let minTurnRadius = DEFAULT_MIN_TURN_RADIUS;
    export let random: () => number = Math.random;

    let svgElement: SVGSVGElement;
    let groupElement: SVGGElement;
    let strokeElement: SVGPathElement;
    let headElement: SVGPathElement;

    interface ActiveArrow {
        trigger: HTMLElement;
        keyboard: boolean;
        length: number;
        durationMs: number;
        startedAt: number;
        dismissing: boolean;
        dismissStart: number;
    }

    interface LineRect {
        left: number;
        top: number;
        width: number;
        height: number;
    }

    let active: ActiveArrow | null = null;
    let frameHandle: number | null = null;
    let dismissArmTimer: ReturnType<typeof setTimeout> | null = null;

    /**
     * Draws the arrow for one activation. Returns false without drawing when
     * the viewport is narrow, the reader prefers reduced motion, or no honest
     * path fits, so the caller can fall back to the native jump before the
     * event finishes dispatching.
     */
    export function tryDraw(request: ArrowRequest): boolean {
        if (window.innerWidth < WIDE_VIEWPORT_MIN_WIDTH_PX) return false;
        if (prefersReducedMotion()) return false;
        if (!svgElement) return false;

        const layer = layerFrame();
        const built = buildArrowPath({
            from: exitPointFor(request.trigger, request.pointer, layer),
            to: entryTipFor(request.entry, layer),
            minTurnRadius,
            leftEdge: ARROW_EDGE_MARGIN_PX - layer.originX,
            rightEdge: layer.width - ARROW_EDGE_MARGIN_PX,
            family: pickFamily(random),
            seed: Math.floor(random() * 2 ** 31),
        });
        if (!built) return false;

        clearArrow();

        const colour = paperBandColor(request.accent);
        const flightMs = Math.min(
            FLIGHT_MAX_MS,
            Math.max(FLIGHT_MIN_MS, FLIGHT_BASE_MS * (built.length / FLIGHT_REFERENCE_LENGTH_PX)),
        );

        strokeElement.setAttribute('d', pathData(built.segments));
        strokeElement.setAttribute('stroke', colour);
        strokeElement.style.strokeDasharray = String(built.length);
        strokeElement.style.strokeDashoffset = String(built.length);

        headElement.setAttribute('d', arrowHeadPath(built.segments[built.segments.length - 1].p3, endTangent(built.segments)));
        headElement.setAttribute('fill', colour);
        headElement.setAttribute('opacity', '0');

        groupElement.setAttribute('opacity', '1');

        active = {
            trigger: request.trigger,
            keyboard: request.keyboard,
            length: built.length,
            durationMs: flightMs,
            startedAt: performance.now(),
            dismissing: false,
            dismissStart: 0,
        };

        armDismissal();
        frameHandle = requestAnimationFrame(tick);
        return true;
    }

    function clearArrow(): void {
        if (dismissArmTimer !== null) {
            clearTimeout(dismissArmTimer);
            dismissArmTimer = null;
        }
        if (frameHandle !== null) {
            cancelAnimationFrame(frameHandle);
            frameHandle = null;
        }
        detachDismissal();
        active = null;

        if (groupElement) {
            groupElement.setAttribute('opacity', '0');
            strokeElement.setAttribute('d', '');
            headElement.setAttribute('d', '');
        }
    }

    function armDismissal(): void {
        // The click that started the arrow is still bubbling up to the
        // document, so the listener goes on one task later or it would dismiss
        // the arrow immediately.
        dismissArmTimer = setTimeout(attachDismissal, 0);
    }

    function attachDismissal(): void {
        dismissArmTimer = null;
        document.addEventListener('click', dismiss);
        document.addEventListener('keydown', dismissFromKey);
        window.addEventListener('resize', dismiss);
    }

    function detachDismissal(): void {
        // onDestroy also runs during server rendering, where the document
        // teardown has nothing to remove from.
        if (typeof document === 'undefined') return;
        document.removeEventListener('click', dismiss);
        document.removeEventListener('keydown', dismissFromKey);
        window.removeEventListener('resize', dismiss);
    }

    function dismissFromKey(event: KeyboardEvent): void {
        if (event.key !== 'Escape') return;
        // Escape hands focus back to the phrase when the activation came from
        // the keyboard, matching the modal behaviour on the page.
        if (active?.keyboard) active.trigger.focus();
        dismiss();
    }

    function dismiss(): void {
        if (!active || active.dismissing) return;

        active.dismissing = true;
        active.dismissStart = performance.now();
        frameHandle = requestAnimationFrame(tick);
    }

    function tick(now: number): void {
        if (!active) return;

        if (active.dismissing) {
            const gone = Math.min(1, Math.max(0, (now - active.dismissStart) / FADE_OUT_MS));
            groupElement.setAttribute('opacity', String(1 - gone));
            if (gone >= 1) {
                clearArrow();
                return;
            }
            frameHandle = requestAnimationFrame(tick);
            return;
        }

        const progress = Math.min(1, Math.max(0, (now - active.startedAt) / active.durationMs));
        strokeElement.style.strokeDashoffset = String(active.length * (1 - easeInOutCubic(progress)));
        headElement.setAttribute(
            'opacity',
            String(
                Math.min(
                    1,
                    Math.max(0, (progress - (1 - HEAD_FADE_SHARE)) / HEAD_FADE_SHARE),
                ),
            ),
        );

        if (progress < 1) frameHandle = requestAnimationFrame(tick);
    }

    function easeInOutCubic(time: number): number {
        return time < 0.5 ? 4 * time * time * time : 1 - Math.pow(-2 * time + 2, 3) / 2;
    }

    /** The SVG's box in document coordinates, so one user unit stays one pixel. */
    function layerFrame(): { originX: number; originY: number; width: number } {
        const rect = svgElement.getBoundingClientRect();
        return {
            originX: rect.left + window.scrollX,
            originY: rect.top + window.scrollY,
            width: rect.width,
        };
    }

    /**
     * A wrapped phrase reports one rect per line, and the union of them spans
     * the whole paragraph, so the exit point comes from the line under the
     * pointer, or the first line for a keyboard activation.
     */
    function exitPointFor(
        trigger: HTMLElement,
        pointer: { x: number; y: number } | null,
        layer: { originX: number; originY: number },
    ): Point {
        const rects = Array.from(trigger.getClientRects())
            .filter((rect) => rect.width > 0 || rect.height > 0)
            .map((rect) => ({
                left: rect.left + window.scrollX,
                top: rect.top + window.scrollY,
                width: rect.width,
                height: rect.height,
            }));

        const chosen = rects.length === 0 ? unionRectFor(trigger) : pickLineRect(rects, pointer);

        return {
            x: chosen.left + PHRASE_PADDING_PX - layer.originX,
            y: chosen.top + chosen.height / 2 - layer.originY,
        };
    }

    function pickLineRect(
        rects: LineRect[],
        pointer: { x: number; y: number } | null,
    ): LineRect {
        if (!pointer) return rects[0];

        const at = { x: pointer.x + window.scrollX, y: pointer.y + window.scrollY };
        const under = rects.find(
            (rect) =>
                at.x >= rect.left &&
                at.x <= rect.left + rect.width &&
                at.y >= rect.top &&
                at.y <= rect.top + rect.height,
        );
        if (under) return under;

        return rects.reduce((nearest, rect) =>
            squaredDistance(rect, at) < squaredDistance(nearest, at) ? rect : nearest,
        );
    }

    function squaredDistance(rect: LineRect, at: { x: number; y: number }): number {
        const x = at.x - (rect.left + rect.width / 2);
        const y = at.y - (rect.top + rect.height / 2);
        return x * x + y * y;
    }

    function unionRectFor(trigger: HTMLElement): LineRect {
        const rect = trigger.getBoundingClientRect();
        return {
            left: rect.left + window.scrollX,
            top: rect.top + window.scrollY,
            width: rect.width,
            height: rect.height,
        };
    }

    function entryTipFor(
        entry: HTMLElement,
        layer: { originX: number; originY: number },
    ): Point {
        const rect = entry.getBoundingClientRect();
        return {
            x: rect.left + window.scrollX - ENTRY_INSET_PX - layer.originX,
            y: rect.top + window.scrollY + rect.height / 2 - layer.originY,
        };
    }

    onDestroy(clearArrow);
</script>

<!-- No viewBox, so one user unit is one pixel, and the path is anchored in
     document coordinates: it scrolls with the page without bookkeeping. -->
<svg
    bind:this={svgElement}
    aria-hidden="true"
    class="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
>
    <g bind:this={groupElement} opacity="0">
        <path
            bind:this={strokeElement}
            fill="none"
            stroke-width={STROKE_WIDTH_PX}
            stroke-linecap="round"
            stroke-linejoin="round"
        />
        <path bind:this={headElement} opacity="0" stroke="none" />
    </g>
</svg>
