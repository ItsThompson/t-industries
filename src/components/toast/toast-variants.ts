import type { ComponentType, SvelteComponent } from 'svelte';
import SummaryToast from './SummaryToast.svelte';
import type { ToastKind } from '$lib/toasts';

export interface ToastVariantProps {
	onDismiss: () => void;
}

export type ToastVariant = ComponentType<SvelteComponent<ToastVariantProps>>;

/** A new kind needs one component and one line here; the host stays unchanged. */
export const TOAST_VARIANTS: Record<ToastKind, ToastVariant> = {
	'summary-origin': SummaryToast
};
