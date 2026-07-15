// Scenario metadata + simulation client.
//
// Maps each UI scenario onto the backend's SimulationRequest contract:
//   POST /simulate  { source_country, target_country, user_profile, mode }
//
// The backend response is a *snapshot* — it doesn't persist runs unless the
// caller explicitly saves one. To keep the /workspace/results/:runId URL
// shareable within a browser session we cache each response client-side.
// Saved runs (from /account/runs) are loaded through workspace/account.ts.

import { api, IS_MOCK_API } from "@/lib/api";

export type ScenarioId =
  | "wealth_transfer"
  | "corporate_structure"
  | "corporate_dividend"
  | "personal_income"
  | "relocation"
  | "inheritance";

export type ScenarioDef = {
  id: ScenarioId;
  title: string;
  audience: "Corporate" | "Individual";
  summary: string;
  math: string;
  originLabel: string;
  destinationLabel: string;
  scaleLabel: string;
  scaleUnit: string;
  mode: SimulationMode;
  perspective: SimulationPerspective;
  incomeType: IncomeType;
  assetType: AssetType;
};

export type SimulationMode =
  | "corporate"
  | "corporate_direct"
  | "inheritance_property"
  | "inheritance_stocks";

export type SimulationPerspective = "individual" | "corporate" | "trust";

export type IncomeType =
  | "dividends"
  | "interest"
  | "royalties"
  | "capital_gains"
  | "employment_income"
  | "business_profit"
  | "rental_income"
  | "inheritance_gift";

export type AssetType =
  | "shares_listed"
  | "shares_unlisted"
  | "real_estate"
  | "ip_rights"
  | "cash_equivalents"
  | "business_operating"
  | "intangible_assets"
  | "tangible_assets";

export const SCENARIOS: readonly ScenarioDef[] = [
  {
    id: "wealth_transfer",
    title: "Wealth transfer",
    audience: "Individual",
    summary:
      "Move family capital across borders while minimising cumulative gift, estate and transfer duty.",
    math: "W = −ln(1 − τ_transfer)",
    originLabel: "Donor residence",
    destinationLabel: "Beneficiary residence",
    scaleLabel: "Transfer amount",
    scaleUnit: "EUR",
    mode: "inheritance_stocks",
    perspective: "individual",
    incomeType: "inheritance_gift",
    assetType: "shares_listed",
  },
  {
    id: "corporate_structure",
    title: "Corporate structure",
    audience: "Corporate",
    summary:
      "Design a holding topology that preserves treaty relief and dividend flow across operating entities.",
    math: "min Σ W(edge) s.t. treaty ∈ path",
    originLabel: "Operating jurisdiction",
    destinationLabel: "Ultimate parent",
    scaleLabel: "Annual profit",
    scaleUnit: "EUR",
    mode: "corporate",
    perspective: "corporate",
    incomeType: "dividends",
    assetType: "shares_unlisted",
  },
  {
    id: "corporate_dividend",
    title: "Corporate dividend",
    audience: "Corporate",
    summary:
      "Route dividends through eligible intermediaries respecting PPT, LOB and beneficial-ownership tests.",
    math: "τ_effective = 1 − Π (1 − τ_edge)",
    originLabel: "Distributing entity",
    destinationLabel: "Recipient shareholder",
    scaleLabel: "Dividend",
    scaleUnit: "EUR",
    mode: "corporate_direct",
    perspective: "corporate",
    incomeType: "dividends",
    assetType: "shares_unlisted",
  },
  {
    id: "personal_income",
    title: "Personal income",
    audience: "Individual",
    summary:
      "Salary, self-employment and passive income across a residence corridor with treaty tie-breakers.",
    math: "τ_net = τ_res + τ_src − credit",
    originLabel: "Employer jurisdiction",
    destinationLabel: "Tax residence",
    scaleLabel: "Gross income",
    scaleUnit: "EUR",
    mode: "corporate_direct",
    perspective: "individual",
    incomeType: "employment_income",
    assetType: "cash_equivalents",
  },
  {
    id: "relocation",
    title: "Relocation",
    audience: "Individual",
    summary:
      "Time a change of tax residence to minimise exit, split-year and re-entry exposure.",
    math: "W_exit = −ln(1 − τ_exit)",
    originLabel: "Current residence",
    destinationLabel: "Target residence",
    scaleLabel: "Net worth",
    scaleUnit: "EUR",
    mode: "corporate_direct",
    perspective: "individual",
    incomeType: "capital_gains",
    assetType: "shares_listed",
  },
  {
    id: "inheritance",
    title: "Inheritance",
    audience: "Individual",
    summary:
      "Cross-border estate flow with situs, forced-heirship and double-tax treaty overlays.",
    math: "τ_estate = f(situs, residence, domicile)",
    originLabel: "Decedent residence",
    destinationLabel: "Heir residence",
    scaleLabel: "Estate value",
    scaleUnit: "EUR",
    mode: "inheritance_property",
    perspective: "individual",
    incomeType: "inheritance_gift",
    assetType: "real_estate",
  },
] as const;

export function getScenario(id: string): ScenarioDef | undefined {
  return SCENARIOS.find((s) => s.id === id);
}

// ----- Backend contracts --------------------------------------------------

export type UserProfileInput = {
  perspective: SimulationPerspective;
  origin_country: string;
  target_country: string;
  simulation_mode: SimulationMode;
  income_type: IncomeType;
  asset_type: AssetType;
  asset_value: number;
  residency_years?: number;
  family_status?: string;
  shareholding_percent?: number;
};

export type SimulationRequestPayload = {
  source_country: string;
  target_country: string;
  user_profile: UserProfileInput;
  mode: SimulationMode;
};

export type PathEdgeDetail = {
  from_country?: string;
  to_country?: string;
  wht_rate?: number | null;
  edge_type?: string;
  citation?: string | null;
  note?: string | null;
} & Record<string, unknown>;

export type SimulationResponse = {
  optimal_path: string[];
  retained_earnings_pct: number | null;
  tax_leakage_pct: number | null;
  savings_band_eur?: string | null;
  hop_count?: number | null;
  teaser_headline?: string | null;
  gated?: boolean;
  entitlement_tier?: string | null;
  compliance_warnings: string[];
  uses_statutory_edges: boolean;
  statutory_edge_details: string[];
  simulation_mode: string;
  perspective: string;
  compliance_pending_notice: string;
  unmapped_jurisdictions: string[];
  unmapped_on_path?: string[];
  best_label_eligible?: boolean;
  data_gaps: string[];
  limitations?: string[];
  optimality_note?: string;
  path_details?: PathEdgeDetail[];
  oecd_cbcr_xml?: string | null;
  globe_gir_xml?: string | null;
};

// UI-augmented result used by the results page. The synthetic runId lets us
// deep-link within a single browser session.
export type WorkspaceRun = SimulationResponse & {
  runId: string;
  scenarioId: ScenarioId;
  scenarioLabel: string;
  amount: number;
  request: SimulationRequestPayload;
};

// ----- Client -------------------------------------------------------------

const RUN_CACHE = new Map<string, WorkspaceRun>();

function mockSimulate(scenario: ScenarioDef, req: SimulationRequestPayload): SimulationResponse {
  const optimalRates = [0.05, 0.0, 0.05];
  const compose = (rates: number[]) => 1 - rates.reduce((p, r) => p * (1 - r), 1);
  const eff = compose(optimalRates);
  return {
    optimal_path: [req.source_country, "CH", req.target_country],
    retained_earnings_pct: (1 - eff) * 100,
    tax_leakage_pct: eff * 100,
    hop_count: 2,
    gated: false,
    compliance_warnings: [],
    uses_statutory_edges: false,
    statutory_edge_details: [],
    simulation_mode: scenario.mode,
    perspective: scenario.perspective,
    compliance_pending_notice:
      "Preview data. Verified statutory rates and citations are available on paid tiers.",
    unmapped_jurisdictions: [],
    unmapped_on_path: [],
    best_label_eligible: true,
    data_gaps: [],
    limitations: ["Illustrative preview — rates simulated for design QA."],
    optimality_note: "log-Dijkstra shortest path under an illustrative rate set.",
    path_details: [
      { from_country: req.source_country, to_country: "CH", wht_rate: 5, edge_type: "dta", note: "Treaty WHT" },
      { from_country: "CH", to_country: req.target_country, wht_rate: 0, edge_type: "participation", note: "Participation exemption" },
    ],
  };
}

export function buildRequest(
  scenario: ScenarioDef,
  input: { origin: string; destination: string; amount: number; familyStatus?: string; residencyYears?: number },
): SimulationRequestPayload {
  return {
    source_country: input.origin,
    target_country: input.destination,
    mode: scenario.mode,
    user_profile: {
      perspective: scenario.perspective,
      origin_country: input.origin,
      target_country: input.destination,
      simulation_mode: scenario.mode,
      income_type: scenario.incomeType,
      asset_type: scenario.assetType,
      asset_value: input.amount,
      residency_years: input.residencyYears,
      family_status: input.familyStatus,
    },
  };
}

export async function runSimulation(
  scenario: ScenarioDef,
  input: { origin: string; destination: string; amount: number; familyStatus?: string; residencyYears?: number },
): Promise<WorkspaceRun> {
  const request = buildRequest(scenario, input);
  const res = await api.post<SimulationResponse>(
    "/simulate",
    request as unknown as Record<string, unknown>,
    { mock: () => mockSimulate(scenario, request) },
  );
  const runId = (typeof crypto !== "undefined" && "randomUUID" in crypto)
    ? crypto.randomUUID()
    : `run-${Math.random().toString(36).slice(2)}-${Date.now()}`;
  const withMeta: WorkspaceRun = {
    ...res,
    runId,
    scenarioId: scenario.id,
    scenarioLabel: scenario.title,
    amount: input.amount,
    request,
  };
  RUN_CACHE.set(runId, withMeta);
  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.setItem(`ts.run.${runId}`, JSON.stringify(withMeta));
    } catch {
      /* quota / disabled — cache-only is fine */
    }
  }
  return withMeta;
}

export function getCachedRun(runId: string): WorkspaceRun | null {
  const hit = RUN_CACHE.get(runId);
  if (hit) return hit;
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(`ts.run.${runId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WorkspaceRun;
    RUN_CACHE.set(runId, parsed);
    return parsed;
  } catch {
    return null;
  }
}

// Optional: top-K alternate paths for advanced tiers.
export type TopPathsResponse = {
  total_paths_found: number;
  paths: Array<{
    rank: number;
    path: string[];
    retained_earnings_pct?: number | null;
    tax_leakage_pct?: number | null;
    uses_statutory_edges: boolean;
    compliance_warnings: string[];
  }>;
  gated: boolean;
  entitlement_tier?: string | null;
};

export async function runTopPaths(
  scenario: ScenarioDef,
  input: { origin: string; destination: string; amount: number },
  topK = 10,
): Promise<TopPathsResponse> {
  const req = { ...buildRequest(scenario, input), top_k: topK };
  return api.post<TopPathsResponse>(
    "/simulate/top-paths",
    req as unknown as Record<string, unknown>,
    {
      mock: () => ({
        total_paths_found: 1,
        paths: [{ rank: 1, path: [input.origin, "CH", input.destination], retained_earnings_pct: 90, tax_leakage_pct: 10, uses_statutory_edges: false, compliance_warnings: [] }],
        gated: true,
      }),
    },
  );
}

// Verified jurisdictions cache — populated from /jurisdictions when available.
export const FALLBACK_JURISDICTIONS = [
  "DE", "US", "CH", "SG", "LU", "IE", "AE", "NL", "GB", "FR", "IT", "ES", "AT",
  "PT", "MT", "CY", "LI", "BE", "SE", "DK", "NO", "FI", "PL", "CZ", "HU",
] as const;

let _juris: string[] | null = null;
export async function loadJurisdictions(): Promise<string[]> {
  if (_juris) return _juris;
  if (IS_MOCK_API) {
    _juris = [...FALLBACK_JURISDICTIONS];
    return _juris;
  }
  try {
    const res = await api.get<{ jurisdictions: string[] } | string[]>("/jurisdictions", {
      mock: () => ({ jurisdictions: [...FALLBACK_JURISDICTIONS] }),
      skipAuth: true,
    });
    const arr = Array.isArray(res) ? res : Array.isArray(res.jurisdictions) ? res.jurisdictions : [];
    _juris = arr.length > 0 ? arr : [...FALLBACK_JURISDICTIONS];
  } catch {
    _juris = [...FALLBACK_JURISDICTIONS];
  }
  return _juris;
}

export function flagEmoji(iso: string): string {
  const code = iso.trim().toUpperCase();
  if (code.length !== 2) return "🏳️";
  const A = 0x1f1e6;
  return String.fromCodePoint(A + code.charCodeAt(0) - 65) + String.fromCodePoint(A + code.charCodeAt(1) - 65);
}
