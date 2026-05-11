import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { observeMotionPreference } from './motion-preference';

describe('motion-preference', () => {
	let addEventListenerSpy: ReturnType<typeof vi.fn>;
	let removeEventListenerSpy: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		addEventListenerSpy = vi.fn();
		removeEventListenerSpy = vi.fn();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	function mockMatchMedia(matches: boolean) {
		vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
			matches,
			addEventListener: addEventListenerSpy,
			removeEventListener: removeEventListenerSpy
		}));
	}

	it('calls onReduce immediately when user prefers reduced motion', () => {
		mockMatchMedia(true);
		const onReduce = vi.fn();
		const onAnimate = vi.fn();

		observeMotionPreference({ onReduce, onAnimate });

		expect(onReduce).toHaveBeenCalledTimes(1);
		expect(onAnimate).not.toHaveBeenCalled();
	});

	it('calls onAnimate immediately when user has no motion preference', () => {
		mockMatchMedia(false);
		const onReduce = vi.fn();
		const onAnimate = vi.fn();

		observeMotionPreference({ onReduce, onAnimate });

		expect(onAnimate).toHaveBeenCalledTimes(1);
		expect(onReduce).not.toHaveBeenCalled();
	});

	it('registers a change listener on the media query', () => {
		mockMatchMedia(false);

		observeMotionPreference({ onReduce: vi.fn(), onAnimate: vi.fn() });

		expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
	});

	it('calls onReduce when preference changes to reduced motion', () => {
		mockMatchMedia(false);
		const onReduce = vi.fn();
		const onAnimate = vi.fn();

		observeMotionPreference({ onReduce, onAnimate });

		const changeHandler = addEventListenerSpy.mock.calls[0][1];
		changeHandler({ matches: true } as MediaQueryListEvent);

		expect(onReduce).toHaveBeenCalledTimes(1);
	});

	it('calls onAnimate when preference changes back to normal', () => {
		mockMatchMedia(true);
		const onReduce = vi.fn();
		const onAnimate = vi.fn();

		observeMotionPreference({ onReduce, onAnimate });

		const changeHandler = addEventListenerSpy.mock.calls[0][1];
		changeHandler({ matches: false } as MediaQueryListEvent);

		expect(onAnimate).toHaveBeenCalledTimes(1);
	});

	it('removes the event listener when cleanup is called', () => {
		mockMatchMedia(false);

		const cleanup = observeMotionPreference({ onReduce: vi.fn(), onAnimate: vi.fn() });
		cleanup();

		expect(removeEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
	});
});
