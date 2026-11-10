/**
 * Separator that follows the item at `index` when a list reads as one sentence:
 * a comma between items, ", and " before the last, nothing after it. Callers
 * that interleave markup between items place this right after each one.
 */
export function proseSeparatorAfter(index: number, itemCount: number): string {
	const lastIndex = itemCount - 1;

	if (index >= lastIndex) return '';
	return index === lastIndex - 1 ? ', and ' : ', ';
}

/** Joins plain strings into one prose list, e.g. "Bath, Swansea, and Taipei". */
export function joinAsProse(items: string[]): string {
	return items
		.map((item, index) => `${item}${proseSeparatorAfter(index, items.length)}`)
		.join('');
}
