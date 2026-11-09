import { THEME_COLORS } from './theme';

/**
 * Brand accents used when a bio link reveals its target. Each color belongs to
 * the organization behind the experience, so a highlighted card reads as that
 * organization rather than as generic UI chrome.
 */
export const ACCENTS = {
	amazon: '#FF9900',
	msd: '#009484',
	criisp: '#ABDBFA',
	// The ethos accent is the site accent, so it follows the Tailwind theme.
	ethos: THEME_COLORS.primary,
	// Matches the bio prose, so an action with no owning organization does not
	// read as a call to action.
	prose: THEME_COLORS.secondary[100]
} as const;
