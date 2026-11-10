/** Origin the site is publicly served from. `CNAME` maps thompsontong.com here. */
export const SITE_ORIGIN = "https://thompsontong.com";

export function canonicalUrl(path: string): string {
  return `${SITE_ORIGIN}${path}`;
}

const ROUTES_ROOT = "/src/routes";

export function stripRouteGroups(path: string): string {
  const segments = path
    .split("/")
    .filter((segment) => segment !== "" && !/^\(.+\)$/.test(segment));

  return `/${segments.join("/")}`;
}

export function routePathFromFile(filePath: string): string {
  return stripRouteGroups(
    filePath.replace(ROUTES_ROOT, "").replace(/\/?\+page\.svelte$/, ""),
  );
}
