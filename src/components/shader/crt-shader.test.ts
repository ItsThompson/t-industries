import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	getMobileScale,
	validateConfig,
	createCRTShader,
	DEFAULT_CRT_CONFIG
} from './crt-shader';
import type { CRTConfig } from './crt-shader';

describe('crt-shader', () => {
	describe('getMobileScale', () => {
		it('returns 0.5 for widths <= 640px', () => {
			expect(getMobileScale(320)).toBe(0.5);
			expect(getMobileScale(640)).toBe(0.5);
		});

		it('returns 1.0 for widths > 1024px', () => {
			expect(getMobileScale(1025)).toBe(1.0);
			expect(getMobileScale(1920)).toBe(1.0);
		});

		it('returns interpolated value between 640 and 1024', () => {
			// Midpoint: 832px → (832-640)/(1024-640) = 192/384 = 0.5 → 0.5 + 0.25 = 0.75
			expect(getMobileScale(832)).toBe(0.75);
		});

		it('returns 0.5 at exact mobile breakpoint', () => {
			expect(getMobileScale(640)).toBe(0.5);
		});

		it('returns value close to 1.0 just below desktop breakpoint', () => {
			const scale = getMobileScale(1024);
			expect(scale).toBeCloseTo(1.0, 5);
		});
	});

	describe('validateConfig', () => {
		it('returns default config when given empty object', () => {
			const result = validateConfig({});
			expect(result).toEqual(DEFAULT_CRT_CONFIG);
		});

		it('merges partial config with defaults', () => {
			const result = validateConfig({ intensity: 0.5 });
			expect(result.intensity).toBe(0.5);
			expect(result.color).toEqual(DEFAULT_CRT_CONFIG.color);
			expect(result.scanlineDensity).toBe(DEFAULT_CRT_CONFIG.scanlineDensity);
		});

		it('clamps intensity to [0, 1]', () => {
			expect(validateConfig({ intensity: -0.5 }).intensity).toBe(0);
			expect(validateConfig({ intensity: 2.0 }).intensity).toBe(1);
		});

		it('clamps color channels to [0, 1]', () => {
			const result = validateConfig({ color: [1.5, -0.2, 0.5] });
			expect(result.color).toEqual([1, 0, 0.5]);
		});

		it('clamps scanlineDensity to [0.1, 10]', () => {
			expect(validateConfig({ scanlineDensity: 0 }).scanlineDensity).toBe(0.1);
			expect(validateConfig({ scanlineDensity: 15 }).scanlineDensity).toBe(10);
		});

		it('clamps flickerSpeed to [0, 20]', () => {
			expect(validateConfig({ flickerSpeed: -1 }).flickerSpeed).toBe(0);
			expect(validateConfig({ flickerSpeed: 25 }).flickerSpeed).toBe(20);
		});

		it('clamps vignetteStrength to [0, 1]', () => {
			expect(validateConfig({ vignetteStrength: -0.5 }).vignetteStrength).toBe(0);
			expect(validateConfig({ vignetteStrength: 1.5 }).vignetteStrength).toBe(1);
		});

		it('preserves valid config values unchanged', () => {
			const config: CRTConfig = {
				color: [0.8, 0.2, 0.4],
				intensity: 0.3,
				scanlineDensity: 2.0,
				flickerSpeed: 3.0,
				vignetteStrength: 0.5
			};
			expect(validateConfig(config)).toEqual(config);
		});
	});

	describe('createCRTShader', () => {
		let mockCanvas: HTMLCanvasElement;
		let mockGl: Record<string, unknown>;

		beforeEach(() => {
			mockGl = {
				createShader: vi.fn().mockReturnValue({}),
				shaderSource: vi.fn(),
				compileShader: vi.fn(),
				getShaderParameter: vi.fn().mockReturnValue(true),
				deleteShader: vi.fn(),
				createProgram: vi.fn().mockReturnValue({}),
				attachShader: vi.fn(),
				linkProgram: vi.fn(),
				getProgramParameter: vi.fn().mockReturnValue(true),
				deleteProgram: vi.fn(),
				useProgram: vi.fn(),
				createBuffer: vi.fn().mockReturnValue({}),
				bindBuffer: vi.fn(),
				bufferData: vi.fn(),
				getAttribLocation: vi.fn().mockReturnValue(0),
				enableVertexAttribArray: vi.fn(),
				vertexAttribPointer: vi.fn(),
				getUniformLocation: vi.fn().mockReturnValue({}),
				uniform1f: vi.fn(),
				uniform2f: vi.fn(),
				uniform3f: vi.fn(),
				enable: vi.fn(),
				blendFunc: vi.fn(),
				viewport: vi.fn(),
				drawArrays: vi.fn(),
				deleteBuffer: vi.fn(),
				VERTEX_SHADER: 35633,
				FRAGMENT_SHADER: 35632,
				COMPILE_STATUS: 35713,
				LINK_STATUS: 35714,
				ARRAY_BUFFER: 34962,
				STATIC_DRAW: 35044,
				FLOAT: 5126,
				TRIANGLE_STRIP: 5,
				BLEND: 3042,
				SRC_ALPHA: 770,
				ONE_MINUS_SRC_ALPHA: 771
			};

			mockCanvas = {
				getContext: vi.fn().mockReturnValue(mockGl),
				width: 1024,
				height: 768
			} as unknown as HTMLCanvasElement;

			vi.stubGlobal('requestAnimationFrame', vi.fn().mockReturnValue(1));
			vi.stubGlobal('cancelAnimationFrame', vi.fn());
			vi.stubGlobal('performance', { now: vi.fn().mockReturnValue(0) });
		});

		afterEach(() => {
			vi.restoreAllMocks();
		});

		it('returns null when WebGL context is unavailable', () => {
			const noGlCanvas = {
				getContext: vi.fn().mockReturnValue(null),
				width: 1024,
				height: 768
			} as unknown as HTMLCanvasElement;

			const result = createCRTShader(noGlCanvas);
			expect(result).toBeNull();
		});

		it('tries webgl2 first, falls back to webgl', () => {
			const canvas = {
				getContext: vi.fn().mockImplementation((contextId: string) => {
					if (contextId === 'webgl2') return null;
					if (contextId === 'webgl') return mockGl;
					return null;
				}),
				width: 1024,
				height: 768
			} as unknown as HTMLCanvasElement;

			const result = createCRTShader(canvas);
			expect(result).not.toBeNull();
			expect(canvas.getContext).toHaveBeenCalledWith('webgl2', expect.any(Object));
			expect(canvas.getContext).toHaveBeenCalledWith('webgl', expect.any(Object));
		});

		it('returns CRTShader object with start, stop, resize, destroy methods', () => {
			const shader = createCRTShader(mockCanvas);

			expect(shader).not.toBeNull();
			expect(shader!.start).toBeInstanceOf(Function);
			expect(shader!.stop).toBeInstanceOf(Function);
			expect(shader!.resize).toBeInstanceOf(Function);
			expect(shader!.destroy).toBeInstanceOf(Function);
		});

		it('returns null when shader compilation fails', () => {
			(mockGl.getShaderParameter as ReturnType<typeof vi.fn>).mockReturnValue(false);

			const result = createCRTShader(mockCanvas);
			expect(result).toBeNull();
		});

		it('returns null when program linking fails', () => {
			(mockGl.getProgramParameter as ReturnType<typeof vi.fn>).mockReturnValue(false);

			const result = createCRTShader(mockCanvas);
			expect(result).toBeNull();
		});

		it('start() calls requestAnimationFrame', () => {
			const shader = createCRTShader(mockCanvas)!;
			shader.start();

			expect(requestAnimationFrame).toHaveBeenCalled();
		});

		it('stop() calls cancelAnimationFrame', () => {
			const shader = createCRTShader(mockCanvas)!;
			shader.start();
			shader.stop();

			expect(cancelAnimationFrame).toHaveBeenCalledWith(1);
		});

		it('start() does not start a second loop if already running', () => {
			const shader = createCRTShader(mockCanvas)!;
			shader.start();
			shader.start();

			expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
		});

		it('resize() updates canvas dimensions and viewport', () => {
			const shader = createCRTShader(mockCanvas)!;
			shader.resize(1920, 1080);

			expect(mockCanvas.width).toBe(1920);
			expect(mockCanvas.height).toBe(1080);
			expect(mockGl.viewport).toHaveBeenCalledWith(0, 0, 1920, 1080);
		});

		it('destroy() cleans up GL resources', () => {
			const shader = createCRTShader(mockCanvas)!;
			shader.start();
			shader.destroy();

			expect(cancelAnimationFrame).toHaveBeenCalled();
			expect(mockGl.deleteBuffer).toHaveBeenCalled();
			expect(mockGl.deleteShader).toHaveBeenCalledTimes(2); // vertex + fragment
			expect(mockGl.deleteProgram).toHaveBeenCalled();
		});

		it('sets static uniforms with validated config values', () => {
			createCRTShader(mockCanvas, {
				color: [0.8, 0.2, 0.4],
				intensity: 0.3
			});

			expect(mockGl.uniform3f).toHaveBeenCalledWith(expect.anything(), 0.8, 0.2, 0.4);
			expect(mockGl.uniform1f).toHaveBeenCalledWith(expect.anything(), 0.3);
		});
	});
});
