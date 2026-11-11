const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export interface MotionPreferenceCallbacks {
  onReduce: () => void;
  onAnimate: () => void;
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia(REDUCED_MOTION_QUERY).matches
  );
}

export function observeMotionPreference(
  callbacks: MotionPreferenceCallbacks,
): () => void {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");

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

  query.addEventListener("change", handleChange);

  return () => {
    query.removeEventListener("change", handleChange);
  };
}
