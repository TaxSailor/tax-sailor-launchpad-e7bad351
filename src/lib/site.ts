// Production origin. Canonical URLs and the sitemap must be absolute, so both
// live here rather than being repeated per route.
export const SITE_URL = "https://www.taxsailor.com";

export function canonical(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return clean === "/" ? `${SITE_URL}/` : `${SITE_URL}${clean}`;
}
