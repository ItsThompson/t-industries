import { base } from "$app/paths";

import { prefersReducedMotion } from "./motion-preference";

export const HIGHLIGHT_PARAM = "highlight";

export function highlightHref(path: string, targetId: string): string {
  return `${base}${path}?${HIGHLIGHT_PARAM}=${encodeURIComponent(targetId)}`;
}

export function readHighlightTarget(url: URL): string | null {
  if (typeof window === "undefined") return null;

  const target = url.searchParams.get(HIGHLIGHT_PARAM)?.trim();
  return target ? target : null;
}

export function scrollToCenter(elementId: string): void {
  if (typeof document === "undefined") return;

  const element = document.getElementById(elementId);
  if (!element || typeof element.scrollIntoView !== "function") return;

  element.scrollIntoView({
    block: "center",
    inline: "nearest",
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
}

export function revealElement(elementId: string): void {
  const scroll = (): void => scrollToCenter(elementId);

  if (typeof requestAnimationFrame === "function") {
    requestAnimationFrame(scroll);
    return;
  }

  scroll();
}
