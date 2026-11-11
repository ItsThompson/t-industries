/** The canvas sits at the site root; the original site pages live under the terminal. */
export const CANVAS_PATH = "/";

export const TERMINAL_PATH = "/terminal";

export type TerminalPage = "experience" | "projects" | "ethos";

export function terminalPath(page: TerminalPage): string {
  return `${TERMINAL_PATH}/${page}`;
}
