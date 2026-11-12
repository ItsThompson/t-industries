import { describe, it, expect } from 'vitest';
import { isInteractiveTarget } from './interactive-target';

function element(markup: string): Element {
	const host = document.createElement('div');
	host.innerHTML = markup;
	const child = host.firstElementChild;
	if (!child) throw new Error('markup produced no element');
	return child;
}

describe('isInteractiveTarget', () => {
	it('holds back for every control the page uses', () => {
		const controls = [
			'<a href="/terminal">link</a>',
			'<button type="button">press</button>',
			'<input />',
			'<select></select>',
			'<textarea></textarea>',
			'<label for="name">label</label>',
			'<summary>summary</summary>',
			'<div role="button">role</div>',
			'<div role="link">role</div>',
			'<div role="checkbox">role</div>',
			'<div role="switch">role</div>',
			'<div role="tab">role</div>',
			'<div contenteditable="true">editable</div>'
		];

		controls.forEach((control) => expect(isInteractiveTarget(element(control))).toBe(true));
	});

	it('treats a child of a control as the control', () => {
		const link = element('<a href="/terminal"><span>child</span></a>');

		expect(isInteractiveTarget(link.firstElementChild)).toBe(true);
	});

	it('lets the prose and the empty page ripple', () => {
		expect(isInteractiveTarget(element('<p>prose</p>'))).toBe(false);
		expect(isInteractiveTarget(element('<div><span>text</span></div>'))).toBe(false);
		expect(isInteractiveTarget(element('<h1>heading</h1>'))).toBe(false);
	});

	it('treats a non-element target as open space', () => {
		expect(isInteractiveTarget(null)).toBe(false);
		expect(isInteractiveTarget(window)).toBe(false);
	});
});
