import type { Point, Size } from './types';

const CLEARANCE_PX = 8;
const PROTECTED_SELECTOR = 'h1, h2, h3, h4, h5, h6, p, a, button, [role="button"], [role="link"]';

export function overlapsProtectedContent(page: ParentNode, position: Point, size: Size): boolean {
  for (const element of page.querySelectorAll<HTMLElement>(PROTECTED_SELECTOR)) {
    const rect = element.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0 || element.closest('[hidden]')) continue;
    const { visibility } = getComputedStyle(element);
    if (visibility === 'hidden' || visibility === 'collapse') continue;

    const left = rect.left + window.scrollX - CLEARANCE_PX;
    const right = rect.right + window.scrollX + CLEARANCE_PX;
    const top = rect.top + window.scrollY - CLEARANCE_PX;
    const bottom = rect.bottom + window.scrollY + CLEARANCE_PX;
    if (
      position.x < right && position.x + size.width > left &&
      position.y < bottom && position.y + size.height > top
    ) return true;
  }
  return false;
}
