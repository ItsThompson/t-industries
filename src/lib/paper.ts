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

export type PageTone = "terminal" | "paper";

export const PAPER_BAND_ALPHA = 0.4;

export const PAPER_BAND_ALPHA_HOVER = 0.54;

export const PAPER_BAND_MIN_CONTRAST = 1.5;

const DARKEN_STEP = 0.1;

/**
 * Band styling shared by every highlighter on the paper page. The band color
 * and its two opacities arrive as the `--band`, `--band-alpha`, and
 * `--band-alpha-hover` custom properties, so the alpha values live here and not
 * in each component's stylesheet.
 */
export const PAPER_BAND_CLASSES =
  "bg-[rgba(var(--band),var(--band-alpha))] hover:bg-[rgba(var(--band),var(--band-alpha-hover))] [box-decoration-break:clone] [-webkit-box-decoration-break:clone] px-[0.18em] py-[0.04em] -mx-[0.02em] rounded-[3px] transition-colors duration-150 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-paper-ink";

export function hexToRgbTriplet(hex: string): string {
  const { r, g, b } = toRgb(requireColor(hex));
  return [r, g, b].map((channel) => Math.round(channel * 255)).join(",");
}

export function paperBandColor(accent: string): string {
  requireColor(accent);

  const paper = THEME_COLORS.paper.base;
  if (wcagContrast(accent, paper) >= PAPER_BAND_MIN_CONTRAST) return accent;

  for (let amount = DARKEN_STEP; amount < 1; amount += DARKEN_STEP) {
    const darkened = mix(accent, THEME_COLORS.paper.ink, amount);
    if (wcagContrast(darkened, paper) >= PAPER_BAND_MIN_CONTRAST)
      return darkened;
  }

  return THEME_COLORS.paper.ink;
}

export function paperBandStyle(accent: string): string {
  return [
    `--band:${hexToRgbTriplet(paperBandColor(accent))}`,
    `--band-alpha:${PAPER_BAND_ALPHA}`,
    `--band-alpha-hover:${PAPER_BAND_ALPHA_HOVER}`,
  ].join(";");
}

/**
 * Fiber noise tiling at 180px and is drawn once.
 */
export const PAPER_GRAIN_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E\")";

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
