/**
 * Prefiksuje apsolutne putanje baznom putanjom sajta.
 * Na Vercel-u / lokalno je BASE_URL "/", pa je no-op.
 * Na GitHub Pages (podfolder /Lumora/) dodaje prefiks.
 */
const BASE = import.meta.env.BASE_URL.replace(/\/+$/, "");

export function withBase(path: string): string {
  if (!path || path[0] !== "/") return path;
  return BASE + path;
}

/** Da li je `href` trenutna putanja (poredi bez bazne putanje). */
export function isCurrentPath(pathname: string, href: string): boolean {
  const strip = (p: string) =>
    ("/" + p.replace(BASE, "").replace(/^\/+/, "")).replace(/\/+$/, "") || "/";
  const a = strip(pathname);
  const b = strip(href);
  return b === "/" ? a === "/" : a === b || a.startsWith(b + "/");
}
