/**
 * Site palette. This module is the single source of truth: the Tailwind theme
 * imports it, and component code reads the same values from it.
 */
export const THEME_COLORS = {
  primary: "#FF6363",
  secondary: {
    100: "#E2E2D5",
    200: "#888883",
  },
  canvas: {
    base: "#F4EFE2",
    raised: "#FFFEF4",
    ink: "#1C1917",
    muted: "#726C66",
  },
} as const;
