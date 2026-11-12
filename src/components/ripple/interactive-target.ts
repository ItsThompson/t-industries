const INTERACTIVE_SELECTOR = [
	'a',
	'button',
	'input',
	'select',
	'textarea',
	'label',
	'summary',
	'[role="button"]',
	'[role="link"]',
	'[role="checkbox"]',
	'[role="switch"]',
	'[role="tab"]',
	'[contenteditable]:not([contenteditable="false"])'
].join(',');

/**
 * True when the press hit something the reader may be trying to operate,
 * so the backdrop stays out of the way of links, controls, and editable text.
 */
export function isInteractiveTarget(target: EventTarget | null): boolean {
	if (!(target instanceof Element)) return false;

	return target.closest(INTERACTIVE_SELECTOR) !== null;
}
