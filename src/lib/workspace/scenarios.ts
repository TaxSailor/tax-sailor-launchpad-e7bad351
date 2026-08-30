// Scenario metadata + simulation client.
//
// Maps each UI scenario onto the backend contract:
//   POST /simulate            { source_country, target_country, user_profile, mode }
//   POST /simulate/top-paths  same body plus top_k
//
// Wire values for jurisdictions are NAMES ("Germany", "United Arab Emirates"),
// which is what the graph returns in optimal_path and path_details.
//
// The backend returns a snapshot. Runs saved on the account are addressable by
// their numeric id; in-session snapshots get a client-side id so the
// /workspace/results/:runId URL stays usable inside the tab.

import { api } from "@/lib/api";

export type ScenarioId =
  | "wealth_transfer"
  | "corporate_structure"
  | "corporate_dividend"
  | "personal_income"
  | "relocation"
  | "inheritance";

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
  | "business_interest"
  | "financial_assets"
  | "mixed";

export type FamilyStatus =
  | "single"
  | "married"
  | "married_with_children"
  | "single_with_children";

export type RiskAppetite = "low" | "medium" | "high";

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
  defaultOrigin: string;
  defaultDestination: string;
  defaultAmount: number;
  mode: SimulationMode;
  perspective: SimulationPerspective;
  incomeType: IncomeType;
  assetType: AssetType;
};

export const SCENARIOS: readonly ScenarioDef[] = [
  {
    id: "corporate_structure",
    title: "Corporate structure",
    audience: "Corporate",
    summary:
      "Design a holding topology that preserves treaty relief and dividend flow across operating entities.",
    math: "min sum W(edge) subject to treaty in path",
    originLabel: "Operating jurisdiction",
    destinationLabel: "Ultimate parent",
    scaleLabel: "Annual profit",
    scaleUnit: "EUR",
    defaultOrigin: "Germany",
    defaultDestination: "Netherlands",
    defaultAmount: 5_000_000,
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
    math: "effective rate = 1 - product of (1 - rate per hop)",
    originLabel: "Distributing entity",
    destinationLabel: "Recipient shareholder",
    scaleLabel: "Dividend",
    scaleUnit: "EUR",
    defaultOrigin: "Germany",
    defaultDestination: "United Arab Emirates",
    defaultAmount: 1_000_000,
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
    math: "net rate = residence rate + source rate - credit",
    originLabel: "Employer jurisdiction",
    destinationLabel: "Tax residence",
    scaleLabel: "Gross income",
    scaleUnit: "EUR",
    defaultOrigin: "Germany",
    defaultDestination: "Switzerland",
    defaultAmount: 250_000,
    mode: "corporate_direct",
    perspective: "individual",
    incomeType: "employment_income",
    assetType: "financial_assets",
  },
  {
    id: "relocation",
    title: "Relocation",
    audience: "Individual",
    summary:
      "Time a change of tax residence to limit exit, split-year and re-entry exposure.",
    math: "exit weight = -ln(1 - exit rate)",
    originLabel: "Current residence",
    destinationLabel: "Target residence",
    scaleLabel: "Net worth",
    scaleUnit: "EUR",
    defaultOrigin: "Germany",
    defaultDestination: "Portugal",
    defaultAmount: 3_000_000,
    mode: "corporate_direct",
    perspective: "individual",
    incomeType: "capital_gains",
    assetType: "shares_listed",
  },
  {
    id: "wealth_transfer",
    title: "Wealth transfer",
    audience: "Individual",
    summary:
      "Move family capital across borders while limiting cumulative gift, estate and transfer duty.",
    math: "transfer weight = -ln(1 - transfer rate)",
    originLabel: "Donor residence",
    destinationLabel: "Beneficiary residence",
    scaleLabel: "Transfer amount",
    scaleUnit: "EUR",
    defaultOrigin: "Germany",
    defaultDestination: "Austria",
    defaultAmount: 2_000_000,
    mode: "inheritance_stocks",
    perspective: "individual",
    incomeType: "inheritance_gift",
    assetType: "shares_listed",
  },
  {
    id: "inheritance",
    title: "Inheritance",
    audience: "Individual",
    summary:
      "Cross-border estate flow with situs, forced-heirship and double-tax treaty overlays.",
    math: "estate rate = f(situs, residence, domicile)",
    originLabel: "Decedent residence",
    destinationLabel: "Heir residence",
    scaleLabel: "Estate value",
    scaleUnit: "EUR",
    defaultOrigin: "Germany",
    defaultDestination: "Spain",
    defaultAmount: 4_000_000,
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
  family_status?: FamilyStatus;
  num_dependents?: number;
  shareholding_percent?: number;
  has_local_substance?: boolean;
  can_relocate?: boolean;
  risk_appetite?: RiskAppetite;
  annual_profit_eur?: number;
  asset_location_country?: string;
  heir_countries?: string[];
};

export type SimulationRequestPayload = {
  source_country: string;
  target_country: string;
  user_profile: UserProfileInput;
  mode: SimulationMode;
};

export type PathEdgeDetail = {
  from_jurisdiction: string;
  to_jurisdiction: string;
  wht_rate_pct: number;
  edge_type: string;
  is_statutory: boolean;
};

export type CitationTeaser = {
  hop_index?: number | null;
  citation_type: string;
  title: string;
  wht_rate_masked?: string | null;
};

export type SimulationResponse = {
  optimal_path: string[];
  retained_earnings_pct: number | null;
  tax_leakage_pct: number | null;
  retained_pct_band?: string | null;
  savings_band_eur?: string | null;
  retained_pct_masked?: string | null;
  tax_leakage_pct_masked?: string | null;
  hop_count?: number | null;
  compliance_flag_count?: number | null;
  teaser_headline?: string | null;
  citation_teasers?: CitationTeaser[];
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

export type ScenarioInput = {
  origin: string;
  destination: string;
  amount: number;
  familyStatus?: FamilyStatus;
  residencyYears?: number;
  numDependents?: number;
  riskAppetite?: RiskAppetite;
  hasLocalSubstance?: boolean;
  canRelocate?: boolean;
};

export type WorkspaceRun = SimulationResponse & {
  runId: string;
  scenarioId: ScenarioId;
  scenarioLabel: string;
  amount: number;
  input: ScenarioInput;
  request: SimulationRequestPayload;
  savedAt: string;
};

// ----- Client -------------------------------------------------------------

const RUN_CACHE = new Map<string, WorkspaceRun>();
const STORAGE_PREFIX = "ts.run.";

export function buildRequest(
  scenario: ScenarioDef,
  input: ScenarioInput,
): SimulationRequestPayload {
  const profile: UserProfileInput = {
    perspective: scenario.perspective,
    origin_country: input.origin,
    target_country: input.destination,
    simulation_mode: scenario.mode,
    income_type: scenario.incomeType,
    asset_type: scenario.assetType,
    asset_value: input.amount,
  };
  if (input.residencyYears !== undefined) profile.residency_years = input.residencyYears;
  if (input.familyStatus) profile.family_status = input.familyStatus;
  if (input.numDependents !== undefined) profile.num_dependents = input.numDependents;
  if (input.riskAppetite) profile.risk_appetite = input.riskAppetite;
  if (input.hasLocalSubstance !== undefined) profile.has_local_substance = input.hasLocalSubstance;
  if (input.canRelocate !== undefined) profile.can_relocate = input.canRelocate;
  if (scenario.perspective === "corporate") profile.annual_profit_eur = input.amount;
  if (scenario.mode === "inheritance_property") profile.asset_location_country = input.origin;
  if (scenario.mode.startsWith("inheritance")) profile.heir_countries = [input.destination];

  return {
    source_country: input.origin,
    target_country: input.destination,
    mode: scenario.mode,
    user_profile: profile,
  };
}

function newRunId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `run-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

function cacheRun(run: WorkspaceRun): void {
  RUN_CACHE.set(run.runId, run);
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_PREFIX + run.runId, JSON.stringify(run));
    const index = listRecentRunIds().filter((id) => id !== run.runId);
    index.unshift(run.runId);
    window.sessionStorage.setItem("ts.runs.index", JSON.stringify(index.slice(0, 12)));
  } catch {
    /* storage disabled or full: in-memory cache is enough */
  }
}

export function listRecentRunIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem("ts.runs.index");
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

export function listRecentRuns(): WorkspaceRun[] {
  return listRecentRunIds()
    .map((id) => getCachedRun(id))
    .filter((r): r is WorkspaceRun => r !== null);
}

export async function runSimulation(
  scenario: ScenarioDef,
  input: ScenarioInput,
): Promise<WorkspaceRun> {
  const request = buildRequest(scenario, input);
  const res = await api.post<SimulationResponse>(
    "/simulate",
    request as unknown as Record<string, unknown>,
  );
  const run: WorkspaceRun = {
    ...res,
    runId: newRunId(),
    scenarioId: scenario.id,
    scenarioLabel: scenario.title,
    amount: input.amount,
    input,
    request,
    savedAt: new Date().toISOString(),
  };
  cacheRun(run);
  return run;
}

export function getCachedRun(runId: string): WorkspaceRun | null {
  const hit = RUN_CACHE.get(runId);
  if (hit) return hit;
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_PREFIX + runId);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WorkspaceRun;
    RUN_CACHE.set(runId, parsed);
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Rehydrate a run saved on the account (numeric id) into the workspace shape,
 * so /workspace/results/:id deep-links keep working across sessions.
 */
export async function loadRunFromAccount(runId: string): Promise<WorkspaceRun | null> {
  if (!/^\d+$/.test(runId)) return null;
  type Replay = {
    id: number;
    title: string | null;
    scenario_key: string | null;
    simulation_mode: string;
    source_label: string | null;
    target_label: string | null;
    created_at: string;
    request_payload: Record<string, unknown>;
    response_payload: Record<string, unknown> | null;
  };
  const replay = await api.get<Replay>(`/account/runs/${encodeURIComponent(runId)}`);
  if (!replay.response_payload) return null;
  const request = replay.request_payload as unknown as SimulationRequestPayload;
  const scenario =
    (replay.scenario_key ? getScenario(replay.scenario_key) : undefined) ??
    SCENARIOS.find((s) => s.mode === replay.simulation_mode) ??
    SCENARIOS[0]!;
  const amount = Number(request?.user_profile?.asset_value ?? 0);
  const run: WorkspaceRun = {
    ...(replay.response_payload as unknown as SimulationResponse),
    runId: String(replay.id),
    scenarioId: scenario.id,
    scenarioLabel: replay.title ?? scenario.title,
    amount,
    input: {
      origin: request?.source_country ?? replay.source_label ?? "",
      destination: request?.target_country ?? replay.target_label ?? "",
      amount,
    },
    request,
    savedAt: replay.created_at,
  };
  cacheRun(run);
  return run;
}

// ----- Top-K alternates ---------------------------------------------------

export type PathResult = {
  rank: number;
  path: string[];
  retained_earnings_pct?: number | null;
  tax_leakage_pct?: number | null;
  retained_pct_band?: string | null;
  hops?: number | null;
  hop_count?: number | null;
  retained_pct_masked?: string | null;
  tax_leakage_pct_masked?: string | null;
  uses_statutory_edges: boolean;
  path_details?: PathEdgeDetail[];
  unmapped_on_path?: string[];
  best_label_eligible?: boolean;
  compliance_warnings: string[];
};

export type TopPathsResponse = {
  total_paths_found: number;
  source_country: string;
  target_country: string;
  simulation_mode: string;
  perspective: string;
  compliance_pending_notice: string;
  unmapped_jurisdictions: string[];
  data_gaps: string[];
  limitations?: string[];
  optimality_note?: string;
  unverified_cit_jurisdictions?: string[];
  gated: boolean;
  entitlement_tier?: string | null;
  paths: PathResult[];
};

export async function runTopPaths(
  scenario: ScenarioDef,
  input: ScenarioInput,
  topK = 10,
): Promise<TopPathsResponse> {
  const req = { ...buildRequest(scenario, input), top_k: topK };
  return api.post<TopPathsResponse>(
    "/simulate/top-paths",
    req as unknown as Record<string, unknown>,
  );
}

// ----- Best destinations --------------------------------------------------

export type BestDestination = {
  destination: string;
  path: string[];
  retained_earnings_pct?: number | null;
  tax_leakage_pct?: number | null;
  retained_pct_band?: string | null;
  hops?: number | null;
  best_label_eligible: boolean;
  routable: boolean;
  compliance_warnings: string[];
  limitations: string[];
};

export type BestDestinationsResponse = {
  candidates: number;
  compliance_pending_notice: string;
  data_gaps: string[];
  limitations: string[];
  gated: boolean;
  entitlement_tier?: string | null;
  destinations: BestDestination[];
};

export async function runBestDestinations(
  scenario: ScenarioDef,
  input: ScenarioInput,
  topN = 8,
): Promise<BestDestinationsResponse> {
  const req = { ...buildRequest(scenario, input), top_n: topN };
  return api.post<BestDestinationsResponse>(
    "/simulate/best-destinations",
    req as unknown as Record<string, unknown>,
  );
}

// ----- Regulatory exports -------------------------------------------------

export type ExportKind = "cbcr" | "gir";

/** Requests the regulatory XML for a stored request payload. */
export async function fetchExportXml(
  kind: ExportKind,
  request: SimulationRequestPayload,
): Promise<string> {
  const res = await api.post<unknown>(
    `/simulate/export/${kind}`,
    request as unknown as Record<string, unknown>,
  );
  if (typeof res === "string") return res;
  if (res && typeof res === "object") {
    const candidate = (res as Record<string, unknown>)["xml"] ?? (res as Record<string, unknown>)["content"];
    if (typeof candidate === "string") return candidate;
  }
  throw new Error("The export service returned no document.");
}

/** Triggers a browser download for a text document. */
export function downloadText(filename: string, content: string, mime = "application/xml"): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
