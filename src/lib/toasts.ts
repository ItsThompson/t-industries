import { get, writable } from "svelte/store";
import { clearCanvasOrigin, isFromCanvas } from "./canvas-origin";

export const CANVAS_ORIGIN_TOAST_KIND = "canvas-origin";

export type ToastKind = typeof CANVAS_ORIGIN_TOAST_KIND;

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

  if (dismissed.kind === CANVAS_ORIGIN_TOAST_KIND) clearCanvasOrigin();
}

export function clearToasts(): void {
  toastStore.set([]);
}

export function syncCanvasOriginToast(url: URL): void {
  if (isFromCanvas(url)) {
    showToast(CANVAS_ORIGIN_TOAST_KIND);
    return;
  }

  const stale = get(toastStore).filter(
    (toast) => toast.kind === CANVAS_ORIGIN_TOAST_KIND,
  );
  for (const toast of stale) dismissToast(toast.id);
}
