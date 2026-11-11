import {
  converter,
  formatHex,
  interpolate,
  parse,
  useMode,
  modeLrgb,
  modeRgb,
  wcagContrast,
} from "culori/fn";
import type { Color } from "culori/fn";
import { THEME_COLORS } from "./theme";

useMode(modeRgb);
useMode(modeLrgb);

const toRgb = converter("rgb");

export type PageMode = "terminal" | "canvas";

export const CANVAS_BAND_ALPHA = 0.4;

export const CANVAS_BAND_ALPHA_HOVER = 0.54;

export const CANVAS_BAND_MIN_CONTRAST = 1.5;

const DARKEN_STEP = 0.1;

export const CANVAS_BAND_CLASSES =
  "bg-[rgba(var(--band),var(--band-alpha))] hover:bg-[rgba(var(--band),var(--band-alpha-hover))] [box-decoration-break:clone] [-webkit-box-decoration-break:clone] px-[0.18em] py-[0.04em] -mx-[0.02em] rounded-[3px] transition-colors duration-150 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-canvas-ink";

export const CANVAS_PROSE_CLASSES = "text-[1.1875rem] font-light leading-[1.65]";

export function hexToRgbTriplet(hex: string): string {
  const { r, g, b } = toRgb(requireColor(hex));
  return [r, g, b].map((channel) => Math.round(channel * 255)).join(",");
}

export function canvasBandColor(accent: string): string {
  requireColor(accent);

  const background = THEME_COLORS.canvas.base;
  if (wcagContrast(accent, background) >= CANVAS_BAND_MIN_CONTRAST) return accent;

  for (let amount = DARKEN_STEP; amount < 1; amount += DARKEN_STEP) {
    const darkened = mix(accent, THEME_COLORS.canvas.ink, amount);
    if (wcagContrast(darkened, background) >= CANVAS_BAND_MIN_CONTRAST)
      return darkened;
  }

  return THEME_COLORS.canvas.ink;
}

export function canvasBandStyle(accent: string): string {
  return [
    `--band:${hexToRgbTriplet(canvasBandColor(accent))}`,
    `--band-alpha:${CANVAS_BAND_ALPHA}`,
    `--band-alpha-hover:${CANVAS_BAND_ALPHA_HOVER}`,
  ].join(";");
}

export const CANVAS_GRAIN_OPACITY = 0.6;

function mix(from: string, to: string, amount: number): string {
  return formatHex(interpolate([from, to], "rgb")(amount));
}

function requireColor(color: string): Color {
  const parsed = parse(color);
  if (!parsed) {
    throw new Error(`expected a color, received "${color}"`);
  }
  return parsed;
}
