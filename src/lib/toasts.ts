import { get, writable } from "svelte/store";
import { clearSummaryOrigin, isFromSummary } from "./summary-origin";

export const SUMMARY_ORIGIN_TOAST_KIND = "summary-origin";

export type ToastKind = typeof SUMMARY_ORIGIN_TOAST_KIND;

export interface Toast {
  readonly id: number;
  readonly kind: ToastKind;
}

const toastStore = writable<Toast[]>([]);

export const toasts = { subscribe: toastStore.subscribe };

let nextToastId = 1;

export function showToast(kind: ToastKind): void {
  toastStore.update((current) =>
    current.some((toast) => toast.kind === kind)
      ? current
      : [...current, { id: nextToastId++, kind }],
  );
}

export function dismissToast(id: number): void {
  const dismissed = get(toastStore).find((toast) => toast.id === id);
  if (!dismissed) return;

  toastStore.update((current) => current.filter((toast) => toast.id !== id));

  if (dismissed.kind === SUMMARY_ORIGIN_TOAST_KIND) clearSummaryOrigin();
}

export function clearToasts(): void {
  toastStore.set([]);
}

export function syncSummaryOriginToast(url: URL): void {
  if (isFromSummary(url)) {
    showToast(SUMMARY_ORIGIN_TOAST_KIND);
    return;
  }

  const stale = get(toastStore).filter(
    (toast) => toast.kind === SUMMARY_ORIGIN_TOAST_KIND,
  );
  for (const toast of stale) dismissToast(toast.id);
}
