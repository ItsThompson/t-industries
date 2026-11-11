import type { ComponentType, SvelteComponent } from "svelte";
import CanvasToast from "./CanvasToast.svelte";
import type { ToastKind } from "$lib/toasts";

export interface ToastVariantProps {
  onDismiss: () => void;
}

export type ToastVariant = ComponentType<SvelteComponent<ToastVariantProps>>;

export const TOAST_VARIANTS: Record<ToastKind, ToastVariant> = {
  "canvas-origin": CanvasToast,
};
