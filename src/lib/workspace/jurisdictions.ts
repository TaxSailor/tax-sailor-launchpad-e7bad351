// Jurisdiction catalogue.
//
// GET /jurisdictions returns { jurisdictions: [{ code, name }] }.
// The simulation endpoints accept and return jurisdiction NAMES
// ("Germany", "United Arab Emirates"), so names are the wire values and
// codes are used only to render flags.

import { api } from "@/lib/api";

export type Jurisdiction = { code: string; name: string };

export const FALLBACK_JURISDICTIONS: readonly Jurisdiction[] = [
  { code: "DE", name: "Germany" },
  { code: "AT", name: "Austria" },
  { code: "CH", name: "Switzerland" },
  { code: "NL", name: "Netherlands" },
  { code: "LU", name: "Luxembourg" },
  { code: "IE", name: "Ireland" },
  { code: "GB", name: "United Kingdom" },
  { code: "FR", name: "France" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "PT", name: "Portugal" },
  { code: "MT", name: "Malta" },
  { code: "CY", name: "Cyprus" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SG", name: "Singapore" },
  { code: "US", name: "United States" },
  { code: "BH", name: "Bahrain" },
] as const;

let cache: Jurisdiction[] | null = null;
let inflight: Promise<Jurisdiction[]> | null = null;

export function loadJurisdictions(): Promise<Jurisdiction[]> {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;
  inflight = api
    .get<{ jurisdictions: Jurisdiction[] }>("/jurisdictions", { skipAuth: true })
    .then((res) => {
      const list = Array.isArray(res?.jurisdictions) ? res.jurisdictions : [];
      cache = list.length > 0 ? list : [...FALLBACK_JURISDICTIONS];
      return cache;
    })
    .catch(() => {
      cache = [...FALLBACK_JURISDICTIONS];
      return cache;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export function cachedJurisdictions(): Jurisdiction[] {
  return cache ?? [...FALLBACK_JURISDICTIONS];
}

const MANUAL_CODES: Record<string, string> = {
  "United Arab Emirates": "AE",
  "United States": "US",
  "United Kingdom": "GB",
  "Hong Kong": "HK",
  "Czechia": "CZ",
  "Côte d'Ivoire": "CI",
};

export function codeForName(name: string): string | null {
  const needle = name.trim().toLowerCase();
  const hit = cachedJurisdictions().find((j) => j.name.toLowerCase() === needle);
  if (hit) return hit.code;
  if (MANUAL_CODES[name]) return MANUAL_CODES[name]!;
  if (/^[A-Za-z]{2}$/.test(name.trim())) return name.trim().toUpperCase();
  return null;
}

/** Flag emoji for a jurisdiction name or ISO alpha-2 code. */
export function flagFor(nameOrCode: string): string {
  const code = codeForName(nameOrCode);
  if (!code || code.length !== 2) return "\u{1F3F4}";
  const A = 0x1f1e6;
  return (
    String.fromCodePoint(A + code.toUpperCase().charCodeAt(0) - 65) +
    String.fromCodePoint(A + code.toUpperCase().charCodeAt(1) - 65)
  );
}

export function searchJurisdictions(list: Jurisdiction[], query: string, limit = 60): Jurisdiction[] {
  const q = query.trim().toLowerCase();
  if (!q) return list.slice(0, limit);
  const starts: Jurisdiction[] = [];
  const contains: Jurisdiction[] = [];
  for (const j of list) {
    const n = j.name.toLowerCase();
    if (n.startsWith(q) || j.code.toLowerCase() === q) starts.push(j);
    else if (n.includes(q)) contains.push(j);
    if (starts.length >= limit) break;
  }
  return [...starts, ...contains].slice(0, limit);
}
