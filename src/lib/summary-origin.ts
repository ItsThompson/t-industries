import { base } from "$app/paths";
import { replaceState } from "$app/navigation";
import { get } from "svelte/store";
import { page } from "$app/stores";

export const ORIGIN_PARAM = "from";

export const SUMMARY_ORIGIN = "summary";

export const SUMMARY_PATH = "/one-pager";

export function summaryHref(): string {
  return `${base}${SUMMARY_PATH}`;
}

export function withSummaryOrigin(href: string): string {
  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}${ORIGIN_PARAM}=${SUMMARY_ORIGIN}`;
}

export function isFromSummary(url: URL): boolean {
  if (typeof window === "undefined") return false;

  return url.searchParams.get(ORIGIN_PARAM) === SUMMARY_ORIGIN;
}

export function clearSummaryOrigin(): void {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  if (!url.searchParams.has(ORIGIN_PARAM)) return;

  url.searchParams.delete(ORIGIN_PARAM);
  replaceState(url, get(page).state);
}
