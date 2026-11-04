import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { observeViewportWidth, WIDE_VIEWPORT_MIN_WIDTH_PX } from './viewport';

describe('viewport', () => {
	let addEventListenerSpy: ReturnType<typeof vi.fn>;
	let removeEventListenerSpy: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		addEventListenerSpy = vi.fn();
		removeEventListenerSpy = vi.fn();
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	function mockMatchMedia(matches: boolean): ReturnType<typeof vi.fn> {
		const matchMediaMock = vi.fn().mockReturnValue({
			matches,
			addEventListener: addEventListenerSpy,
			removeEventListener: removeEventListenerSpy
		});
		vi.stubGlobal('matchMedia', matchMediaMock);
		return matchMediaMock;
	}

	it('treats a 1024px viewport as the wide threshold', () => {
		expect(WIDE_VIEWPORT_MIN_WIDTH_PX).toBe(1024);
	});

	it('queries the media query at the exported threshold', () => {
		const matchMediaMock = mockMatchMedia(true);

		observeViewportWidth({ onWide: vi.fn(), onNarrow: vi.fn() });

		expect(matchMediaMock).toHaveBeenCalledWith(
			`(min-width: ${WIDE_VIEWPORT_MIN_WIDTH_PX}px)`
		);
	});

	it('calls onWide immediately when the viewport is wide', () => {
		mockMatchMedia(true);
		const onWide = vi.fn();
		const onNarrow = vi.fn();

		observeViewportWidth({ onWide, onNarrow });

		expect(onWide).toHaveBeenCalledTimes(1);
		expect(onNarrow).not.toHaveBeenCalled();
	});

	it('calls onNarrow immediately when the viewport is narrow', () => {
		mockMatchMedia(false);
		const onWide = vi.fn();
		const onNarrow = vi.fn();

		observeViewportWidth({ onWide, onNarrow });

		expect(onNarrow).toHaveBeenCalledTimes(1);
		expect(onWide).not.toHaveBeenCalled();
	});

	it('registers a change listener on the media query', () => {
		mockMatchMedia(false);

		observeViewportWidth({ onWide: vi.fn(), onNarrow: vi.fn() });

		expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
	});

	it('calls onWide when the viewport grows past the threshold', () => {
		mockMatchMedia(false);
		const onWide = vi.fn();
		const onNarrow = vi.fn();

		observeViewportWidth({ onWide, onNarrow });

		const changeHandler = addEventListenerSpy.mock.calls[0][1];
		changeHandler({ matches: true } as MediaQueryListEvent);

		expect(onWide).toHaveBeenCalledTimes(1);
		expect(onNarrow).toHaveBeenCalledTimes(1);
	});

	it('calls onNarrow when the viewport shrinks below the threshold', () => {
		mockMatchMedia(true);
		const onWide = vi.fn();
		const onNarrow = vi.fn();

		observeViewportWidth({ onWide, onNarrow });

		const changeHandler = addEventListenerSpy.mock.calls[0][1];
		changeHandler({ matches: false } as MediaQueryListEvent);

		expect(onNarrow).toHaveBeenCalledTimes(1);
		expect(onWide).toHaveBeenCalledTimes(1);
	});

	it('removes the change listener when cleanup is called', () => {
		mockMatchMedia(false);

		const cleanup = observeViewportWidth({ onWide: vi.fn(), onNarrow: vi.fn() });
		cleanup();

		expect(removeEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
	});
});
