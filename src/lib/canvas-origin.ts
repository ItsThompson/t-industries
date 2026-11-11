import { base } from "$app/paths";
import { replaceState } from "$app/navigation";
import { get } from "svelte/store";
import { page } from "$app/stores";
import { CANVAS_PATH } from "./routes";

export const ORIGIN_PARAM = "from";

export const CANVAS_ORIGIN = "canvas";

export function canvasHref(): string {
  return `${base}${CANVAS_PATH}`;
}

export function withCanvasOrigin(href: string): string {
  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}${ORIGIN_PARAM}=${CANVAS_ORIGIN}`;
}

export function isFromCanvas(url: URL): boolean {
  if (typeof window === "undefined") return false;

  return url.searchParams.get(ORIGIN_PARAM) === CANVAS_ORIGIN;
}

export function clearCanvasOrigin(): void {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  if (!url.searchParams.has(ORIGIN_PARAM)) return;

  url.searchParams.delete(ORIGIN_PARAM);
  replaceState(url, get(page).state);
}
