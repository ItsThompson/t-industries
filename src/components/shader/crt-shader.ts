export interface CRTConfig {
	color: [number, number, number];
	intensity: number;
	scanlineDensity: number;
	flickerSpeed: number;
	vignetteStrength: number;
}

export interface CRTShader {
	start(): void;
	stop(): void;
	resize(width: number, height: number): void;
	destroy(): void;
}

export const DEFAULT_CRT_CONFIG: CRTConfig = {
	color: [1.0, 0.388, 0.388],
	intensity: 0.15,
	scanlineDensity: 1.5,
	flickerSpeed: 2.0,
	vignetteStrength: 0.25
};

const MOBILE_BREAKPOINT = 640;
const DESKTOP_BREAKPOINT = 1024;

export function getMobileScale(viewportWidth: number): number {
	if (viewportWidth <= MOBILE_BREAKPOINT) return 0.5;
	if (viewportWidth > DESKTOP_BREAKPOINT) return 1.0;
	// Linear interpolation between breakpoints
	const ratio = (viewportWidth - MOBILE_BREAKPOINT) / (DESKTOP_BREAKPOINT - MOBILE_BREAKPOINT);
	return 0.5 + ratio * 0.5;
}

export function validateConfig(config: Partial<CRTConfig>): CRTConfig {
	const merged = { ...DEFAULT_CRT_CONFIG, ...config };

	const clamp = (value: number, min: number, max: number): number =>
		Math.max(min, Math.min(max, value));

	return {
		color: [
			clamp(merged.color[0], 0, 1),
			clamp(merged.color[1], 0, 1),
			clamp(merged.color[2], 0, 1)
		],
		intensity: clamp(merged.intensity, 0, 1),
		scanlineDensity: clamp(merged.scanlineDensity, 0.1, 10),
		flickerSpeed: clamp(merged.flickerSpeed, 0, 20),
		vignetteStrength: clamp(merged.vignetteStrength, 0, 1)
	};
}

const VERTEX_SHADER_SOURCE = `
attribute vec2 aPosition;

void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER_SOURCE = `
precision mediump float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColor;
uniform float uIntensity;
uniform float uScanlineDensity;
uniform float uFlickerSpeed;
uniform float uVignetteStrength;

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;

    // Scanline pattern
    float scanline = sin(uv.y * uResolution.y * uScanlineDensity) * 0.5 + 0.5;
    scanline = pow(scanline, 1.5);

    // Subtle time-based flicker
    float flicker = 1.0 + sin(uTime * uFlickerSpeed) * 0.005;

    // Vignette
    vec2 vignetteUV = uv * (1.0 - uv);
    float vignette = vignetteUV.x * vignetteUV.y * 15.0;
    vignette = pow(vignette, uVignetteStrength);

    // Compose
    float brightness = scanline * flicker * vignette * uIntensity;
    gl_FragColor = vec4(uColor * brightness, brightness * 0.3);
}
`;

function compileShader(
	gl: WebGLRenderingContext,
	source: string,
	type: number
): WebGLShader | null {
	const shader = gl.createShader(type);
	if (!shader) return null;

	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		gl.deleteShader(shader);
		return null;
	}

	return shader;
}

function createProgram(
	gl: WebGLRenderingContext,
	vertexShader: WebGLShader,
	fragmentShader: WebGLShader
): WebGLProgram | null {
	const program = gl.createProgram();
	if (!program) return null;

	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		gl.deleteProgram(program);
		return null;
	}

	return program;
}

function getWebGLContext(canvas: HTMLCanvasElement): WebGLRenderingContext | null {
	const gl =
		(canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: false }) as WebGLRenderingContext | null) ??
		(canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false }) as WebGLRenderingContext | null);
	return gl;
}

export function createCRTShader(
	canvas: HTMLCanvasElement,
	config: Partial<CRTConfig> = {}
): CRTShader | null {
	const glContext = getWebGLContext(canvas);
	if (!glContext) return null;
	// Assign to a new const so TypeScript narrows the type in closures
	const gl: WebGLRenderingContext = glContext;

	const validatedConfig = validateConfig(config);

	const vertexShader = compileShader(gl, VERTEX_SHADER_SOURCE, gl.VERTEX_SHADER);
	const fragmentShader = compileShader(gl, FRAGMENT_SHADER_SOURCE, gl.FRAGMENT_SHADER);
	if (!vertexShader || !fragmentShader) return null;

	const program = createProgram(gl, vertexShader, fragmentShader);
	if (!program) return null;

	gl.useProgram(program);

	// Full-screen quad (two triangles via TRIANGLE_STRIP)
	const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
	const buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

	const aPosition = gl.getAttribLocation(program, 'aPosition');
	gl.enableVertexAttribArray(aPosition);
	gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

	// Uniform locations
	const uTime = gl.getUniformLocation(program, 'uTime');
	const uResolution = gl.getUniformLocation(program, 'uResolution');
	const uColor = gl.getUniformLocation(program, 'uColor');
	const uIntensity = gl.getUniformLocation(program, 'uIntensity');
	const uScanlineDensity = gl.getUniformLocation(program, 'uScanlineDensity');
	const uFlickerSpeed = gl.getUniformLocation(program, 'uFlickerSpeed');
	const uVignetteStrength = gl.getUniformLocation(program, 'uVignetteStrength');

	// Set static uniforms
	gl.uniform3f(uColor, validatedConfig.color[0], validatedConfig.color[1], validatedConfig.color[2]);
	gl.uniform1f(uIntensity, validatedConfig.intensity);
	gl.uniform1f(uScanlineDensity, validatedConfig.scanlineDensity);
	gl.uniform1f(uFlickerSpeed, validatedConfig.flickerSpeed);
	gl.uniform1f(uVignetteStrength, validatedConfig.vignetteStrength);

	// Enable blending for transparency
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

	let animationFrameId: number | null = null;
	let startTime = 0;

	function renderFrame(time: number): void {
		const elapsed = (time - startTime) / 1000;
		gl.uniform1f(uTime, elapsed);
		gl.uniform2f(uResolution, canvas.width, canvas.height);
		gl.viewport(0, 0, canvas.width, canvas.height);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	}

	function animationLoop(time: number): void {
		renderFrame(time);
		animationFrameId = requestAnimationFrame(animationLoop);
	}

	const shader: CRTShader = {
		start(): void {
			if (animationFrameId !== null) return;
			startTime = performance.now();
			animationFrameId = requestAnimationFrame(animationLoop);
		},

		stop(): void {
			if (animationFrameId !== null) {
				cancelAnimationFrame(animationFrameId);
				animationFrameId = null;
			}
		},

		resize(width: number, height: number): void {
			canvas.width = width;
			canvas.height = height;
			gl.viewport(0, 0, width, height);
			gl.uniform2f(uResolution, width, height);
			// Render one frame immediately so the resize is visible
			renderFrame(performance.now());
		},

		destroy(): void {
			shader.stop();
			gl.deleteBuffer(buffer);
			gl.deleteShader(vertexShader);
			gl.deleteShader(fragmentShader);
			gl.deleteProgram(program);
		}
	};

	return shader;
}
