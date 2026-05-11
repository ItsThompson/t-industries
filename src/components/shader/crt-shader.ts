export interface CRTConfig {
  color: [number, number, number];
  intensity: number;
  scanlineDensity: number;
  flickerSpeed: number;
  vignetteStrength: number;
  aberrationStrength: number;
  glitchSpeed: number;
  glitchIntensity: number;
}

export interface CRTShader {
  start(): void;
  stop(): void;
  resize(width: number, height: number): void;
  destroy(): void;
}

export const DEFAULT_CRT_CONFIG: CRTConfig = {
  color: [0.533, 0.533, 0.514],
  intensity: 0.35,
  scanlineDensity: 1.5,
  flickerSpeed: 2.0,
  vignetteStrength: 0.25,
  aberrationStrength: 0.003,
  glitchSpeed: 0.4,
  glitchIntensity: 0.3,
};

const MOBILE_BREAKPOINT = 640;
const DESKTOP_BREAKPOINT = 1024;

export function getMobileScale(viewportWidth: number): number {
  if (viewportWidth <= MOBILE_BREAKPOINT) return 0.5;
  if (viewportWidth > DESKTOP_BREAKPOINT) return 1.0;
  // Linear interpolation between breakpoints
  const ratio =
    (viewportWidth - MOBILE_BREAKPOINT) /
    (DESKTOP_BREAKPOINT - MOBILE_BREAKPOINT);
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
      clamp(merged.color[2], 0, 1),
    ],
    intensity: clamp(merged.intensity, 0, 1),
    scanlineDensity: clamp(merged.scanlineDensity, 0.1, 10),
    flickerSpeed: clamp(merged.flickerSpeed, 0, 20),
    vignetteStrength: clamp(merged.vignetteStrength, 0, 1),
    aberrationStrength: clamp(merged.aberrationStrength, 0, 0.02),
    glitchSpeed: clamp(merged.glitchSpeed, 0, 5),
    glitchIntensity: clamp(merged.glitchIntensity, 0, 1),
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
uniform float uAberrationStrength;
uniform float uGlitchSpeed;
uniform float uGlitchIntensity;

float random(vec2 st) {
    return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;

    // Chromatic aberration: RGB channel separation increasing toward edges
    float distFromCenter = length(uv - vec2(0.5));
    float aberration = distFromCenter * uAberrationStrength;
    vec2 uvR = uv + vec2(aberration, 0.0);
    vec2 uvB = uv - vec2(aberration, 0.0);

    // Scanline pattern per channel (offset UVs give color fringing on lines)
    float scanG = sin(uv.y * uResolution.y * uScanlineDensity) * 0.5 + 0.5;
    scanG = pow(scanG, 1.2);
    float scanR = sin(uvR.y * uResolution.y * uScanlineDensity) * 0.5 + 0.5;
    scanR = pow(scanR, 1.2);
    float scanB = sin(uvB.y * uResolution.y * uScanlineDensity) * 0.5 + 0.5;
    scanB = pow(scanB, 1.2);

    // Glitch bands: thin horizontal bands that scroll slowly
    float glitchSeed = floor(uTime * uGlitchSpeed);
    float bandY = random(vec2(glitchSeed, 0.0));
    float bandWidth = 0.01 + random(vec2(glitchSeed, 1.0)) * 0.02;
    float band = smoothstep(bandY - bandWidth, bandY, uv.y)
               - smoothstep(bandY, bandY + bandWidth, uv.y);
    float glitch = band * uGlitchIntensity;

    // Time-based flicker
    float flicker = 1.0 + sin(uTime * uFlickerSpeed) * 0.02;

    // Vignette
    vec2 vignetteUV = uv * (1.0 - uv);
    float vignette = vignetteUV.x * vignetteUV.y * 15.0;
    vignette = pow(vignette, uVignetteStrength);

    // Per-channel masks (aberration splits R and B scanlines)
    float maskR = scanR * flicker * vignette + glitch;
    float maskG = scanG * flicker * vignette + glitch;
    float maskB = scanB * flicker * vignette + glitch;

    // Output non-premultiplied RGBA for browser canvas compositing.
    // Color carries the per-channel aberration; alpha controls overall visibility.
    float maxMask = max(max(maskR, maskG), maskB);
    float alpha = uIntensity * maxMask;
    vec3 color = maxMask > 0.001
        ? vec3(uColor.r * maskR, uColor.g * maskG, uColor.b * maskB) / maxMask
        : vec3(0.0);
    gl_FragColor = vec4(color, alpha);
}
`;

function compileShader(
  gl: WebGLRenderingContext,
  source: string,
  type: number,
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
  fragmentShader: WebGLShader,
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

function getWebGLContext(
  canvas: HTMLCanvasElement,
): WebGLRenderingContext | null {
  const gl =
    (canvas.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: false,
    }) as WebGLRenderingContext | null) ??
    (canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
    }) as WebGLRenderingContext | null);
  return gl;
}

export function createCRTShader(
  canvas: HTMLCanvasElement,
  config: Partial<CRTConfig> = {},
): CRTShader | null {
  const glContext = getWebGLContext(canvas);
  if (!glContext) return null;
  // Assign to a new const so TypeScript narrows the type in closures
  const gl: WebGLRenderingContext = glContext;

  const validatedConfig = validateConfig(config);

  const vertexShader = compileShader(
    gl,
    VERTEX_SHADER_SOURCE,
    gl.VERTEX_SHADER,
  );
  const fragmentShader = compileShader(
    gl,
    FRAGMENT_SHADER_SOURCE,
    gl.FRAGMENT_SHADER,
  );
  if (!vertexShader || !fragmentShader) return null;

  const program = createProgram(gl, vertexShader, fragmentShader);
  if (!program) return null;

  gl.useProgram(program);

  // Full-screen quad (two triangles via TRIANGLE_STRIP)
  const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  const aPosition = gl.getAttribLocation(program, "aPosition");
  gl.enableVertexAttribArray(aPosition);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

  // Uniform locations
  const uTime = gl.getUniformLocation(program, "uTime");
  const uResolution = gl.getUniformLocation(program, "uResolution");
  const uColor = gl.getUniformLocation(program, "uColor");
  const uIntensity = gl.getUniformLocation(program, "uIntensity");
  const uScanlineDensity = gl.getUniformLocation(program, "uScanlineDensity");
  const uFlickerSpeed = gl.getUniformLocation(program, "uFlickerSpeed");
  const uVignetteStrength = gl.getUniformLocation(program, "uVignetteStrength");
  const uAberrationStrength = gl.getUniformLocation(
    program,
    "uAberrationStrength",
  );
  const uGlitchSpeed = gl.getUniformLocation(program, "uGlitchSpeed");
  const uGlitchIntensity = gl.getUniformLocation(program, "uGlitchIntensity");

  // Set static uniforms
  gl.uniform3f(
    uColor,
    validatedConfig.color[0],
    validatedConfig.color[1],
    validatedConfig.color[2],
  );
  gl.uniform1f(uIntensity, validatedConfig.intensity);
  gl.uniform1f(uScanlineDensity, validatedConfig.scanlineDensity);
  gl.uniform1f(uFlickerSpeed, validatedConfig.flickerSpeed);
  gl.uniform1f(uVignetteStrength, validatedConfig.vignetteStrength);
  gl.uniform1f(uAberrationStrength, validatedConfig.aberrationStrength);
  gl.uniform1f(uGlitchSpeed, validatedConfig.glitchSpeed);
  gl.uniform1f(uGlitchIntensity, validatedConfig.glitchIntensity);

  // No WebGL blending needed: we draw a single fullscreen quad onto a cleared
  // canvas. The browser's own canvas compositing (premultipliedAlpha: false)
  // handles alpha blending against the page background.

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
    },
  };

  return shader;
}
