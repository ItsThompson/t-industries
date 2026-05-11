/**
 * Determines which section is "active" based on visibility ratios and DOM positions.
 *
 * Algorithm: among sections with intersectionRatio > 0, pick the one whose
 * top edge is closest to (but not necessarily above) the viewport top.
 * This matches natural reading order: the topmost visible section wins.
 */
export function selectActiveSection(
	visibilityMap: Map<string, number>,
	getRect: (id: string) => DOMRect | null
): string {
	let topSection = '';
	let topPosition = Infinity;

	visibilityMap.forEach((ratio, id) => {
		if (ratio <= 0) return;

		const rect = getRect(id);
		if (!rect) return;

		if (rect.top < topPosition) {
			topPosition = rect.top;
			topSection = id;
		}
	});

	return topSection;
}

export interface SectionObserverOptions {
	sectionIds: string[];
	onActiveSectionChange: (sectionId: string) => void;
}

/**
 * Creates an IntersectionObserver that tracks which page section is most visible.
 * Returns a cleanup function to disconnect the observer.
 *
 * Returns undefined if IntersectionObserver is not available (e.g., in jsdom).
 */
export function createSectionObserver(
	options: SectionObserverOptions
): (() => void) | undefined {
	if (typeof IntersectionObserver === 'undefined') return undefined;

	const { sectionIds, onActiveSectionChange } = options;

	const sectionElements = sectionIds
		.map((id) => document.getElementById(id))
		.filter((el): el is HTMLElement => el !== null);

	if (sectionElements.length === 0) return undefined;

	const visibilityMap = new Map<string, number>();

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				visibilityMap.set(entry.target.id, entry.intersectionRatio);
			});

			const activeId = selectActiveSection(visibilityMap, (id) => {
				const el = document.getElementById(id);
				return el ? el.getBoundingClientRect() : null;
			});

			if (activeId) {
				onActiveSectionChange(activeId);
			}
		},
		{ threshold: [0, 0.3, 0.6, 1.0] }
	);

	sectionElements.forEach((el) => observer.observe(el));

	return () => observer.disconnect();
}
