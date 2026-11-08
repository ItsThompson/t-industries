/**
 * Brand accents used when a bio link reveals its target. Each color belongs to
 * the organization behind the experience, so a highlighted card reads as that
 * organization rather than as generic UI chrome.
 */
export const ACCENTS = {
	amazon: '#FF9900',
	msd: '#009484',
	criisp: '#ABDBFA',
	ethos: '#FF6363'
} as const;

export type AccentKey = keyof typeof ACCENTS;
