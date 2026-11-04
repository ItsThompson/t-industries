export const WIDE_VIEWPORT_MIN_WIDTH_PX = 1024;

export interface ViewportWidthCallbacks {
	onWide: () => void;
	onNarrow: () => void;
}

/**
 * Observes whether the viewport is at least wide enough for the desktop
 * effects, invoking the matching callback immediately and on every change.
 * Returns a cleanup function that removes the media query listener.
 */
export function observeViewportWidth(callbacks: ViewportWidthCallbacks): () => void {
	const query = window.matchMedia(`(min-width: ${WIDE_VIEWPORT_MIN_WIDTH_PX}px)`);

	function handleChange(event: MediaQueryListEvent): void {
		if (event.matches) {
			callbacks.onWide();
		} else {
			callbacks.onNarrow();
		}
	}

	if (query.matches) {
		callbacks.onWide();
	} else {
		callbacks.onNarrow();
	}

	query.addEventListener('change', handleChange);

	return () => {
		query.removeEventListener('change', handleChange);
	};
}
