const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export interface MotionPreferenceCallbacks {
	onReduce: () => void;
	onAnimate: () => void;
}

/** Reports the reduced-motion preference as it stands right now, for per-interaction decisions. */
export function prefersReducedMotion(): boolean {
	return (
		typeof window !== 'undefined' &&
		typeof window.matchMedia === 'function' &&
		window.matchMedia(REDUCED_MOTION_QUERY).matches
	);
}

/**
 * Observes the user's reduced-motion preference and invokes the appropriate
 * callback immediately and on subsequent changes. Returns a cleanup function
 * that removes the media query listener.
 */
export function observeMotionPreference(callbacks: MotionPreferenceCallbacks): () => void {
	const query = window.matchMedia('(prefers-reduced-motion: reduce)');

	function handleChange(event: MediaQueryListEvent): void {
		if (event.matches) {
			callbacks.onReduce();
		} else {
			callbacks.onAnimate();
		}
	}

	if (query.matches) {
		callbacks.onReduce();
	} else {
		callbacks.onAnimate();
	}

	query.addEventListener('change', handleChange);

	return () => {
		query.removeEventListener('change', handleChange);
	};
}
