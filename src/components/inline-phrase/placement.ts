/**
 * Card geometry, free of the DOM so the arithmetic is testable without a
 * browser. Callers pass plain rectangles in from `getClientRects`.
 */

export interface Point {
    x: number;
    y: number;
}

export interface Rect {
    top: number;
    left: number;
    bottom: number;
    right: number;
    width: number;
    height: number;
}

export interface Size {
    width: number;
    height: number;
}

export interface Viewport {
    width: number;
    height: number;
}

export interface PlacementInput {
    anchor: Rect;
    card: Size;
    viewport: Viewport;
    gap: number;
    margin: number;
}

export interface Placement {
    left: number;
    top: number;
}

export function isOffscreen(anchor: Rect, viewportHeight: number): boolean {
    return anchor.bottom < 0 || anchor.top > viewportHeight;
}

/**
 * A phrase that wraps has one rect per line, and the union of them spans the
 * whole paragraph, so centring on it drops the card somewhere unrelated. Pick
 * the line the reader points at, or the nearest one when the pointer sits past
 * every line. Returns `null` when no line reported a size, which leaves the
 * caller to fall back to the phrase's bounding box.
 */
export function pickLine(lines: Rect[], pointer: Point | null): Rect | null {
    const measured = lines.filter((line) => line.width > 0 || line.height > 0);
    if (measured.length === 0) return null;
    if (!pointer) return measured[0];

    const under = measured.find(
        (line) =>
            pointer.x >= line.left &&
            pointer.x <= line.right &&
            pointer.y >= line.top &&
            pointer.y <= line.bottom
    );
    if (under) return under;

    return measured.reduce((nearest, line) =>
        distanceTo(line, pointer) < distanceTo(nearest, pointer) ? line : nearest
    );
}

export function placeCard({ anchor, card, viewport, gap, margin }: PlacementInput): Placement {
    const maxLeft = Math.max(margin, viewport.width - card.width - margin);
    const centered = anchor.left + anchor.width / 2 - card.width / 2;
    const left = Math.max(margin, Math.min(centered, maxLeft));

    const above = anchor.top - card.height - gap;
    const top = above < margin ? anchor.bottom + gap : above;

    return { left, top };
}

function distanceTo(rect: Rect, point: Point): number {
    const x = point.x - (rect.left + rect.width / 2);
    const y = point.y - (rect.top + rect.height / 2);
    return x * x + y * y;
}
