// Scenario metadata — mirrors the backend's ScenarioId set.
// The full config lives on the FastAPI backend; this is the marketing-facing
// summary used by the picker and questionnaire scaffolds.

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
};

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
  },
] as const;

export function getScenario(id: string): ScenarioDef | undefined {
  return SCENARIOS.find((s) => s.id === id);
}

// ----- Simulation types ---------------------------------------------------

export type SimulationRequest = {
  scenarioId: ScenarioId;
  origin: string;
  destination: string;
  amount: number;
  familyStatus?: "single" | "married" | "family";
};

export type RouteHop = {
  jurisdiction: string;
  flag: string;
  edgeTax: number; // effective rate 0..1 applied at this hop
  note: string;
};

export type SimulationResponse = {
  runId: string;
  scenarioId: ScenarioId;
  amount: number;
  optimal: {
    hops: RouteHop[];
    effectiveTax: number;
    retained: number;
    weight: number;
  };
  baseline: {
    hops: RouteHop[];
    effectiveTax: number;
    retained: number;
    weight: number;
  };
  savings: number;
  citations: Array<{ code: string; title: string; article: string }>;
};

import { api, IS_MOCK_API } from "@/lib/api";

function mockSimulate(req: SimulationRequest): SimulationResponse {
  const optimalRates = [0.05, 0.0, 0.05];
  const baselineRates = [0.26, 0.15, 0.15];
  const compose = (rates: number[]) => 1 - rates.reduce((p, r) => p * (1 - r), 1);

  const eff = compose(optimalRates);
  const base = compose(baselineRates);
  const retainedOpt = req.amount * (1 - eff);
  const retainedBase = req.amount * (1 - base);

  const flagOf = (code: string) =>
    ({ US: "🇺🇸", DE: "🇩🇪", CH: "🇨🇭", SG: "🇸🇬", LU: "🇱🇺", IE: "🇮🇪", AE: "🇦🇪" })[code] ?? "🏳️";

  return {
    runId: `mock-${Math.random().toString(36).slice(2, 10)}`,
    scenarioId: req.scenarioId,
    amount: req.amount,
    optimal: {
      hops: [
        { jurisdiction: req.origin, flag: flagOf(req.origin), edgeTax: optimalRates[0], note: "Source WHT under treaty" },
        { jurisdiction: "CH", flag: "🇨🇭", edgeTax: optimalRates[1], note: "Participation exemption" },
        { jurisdiction: req.destination, flag: flagOf(req.destination), edgeTax: optimalRates[2], note: "Recipient WHT" },
      ],
      effectiveTax: eff,
      retained: retainedOpt,
      weight: -Math.log(1 - eff),
    },
    baseline: {
      hops: [
        { jurisdiction: req.origin, flag: flagOf(req.origin), edgeTax: baselineRates[0], note: "Statutory WHT" },
        { jurisdiction: req.destination, flag: flagOf(req.destination), edgeTax: baselineRates[1], note: "Recipient tax" },
        { jurisdiction: req.destination, flag: flagOf(req.destination), edgeTax: baselineRates[2], note: "Distribution tax" },
      ],
      effectiveTax: base,
      retained: retainedBase,
      weight: -Math.log(1 - base),
    },
    savings: retainedOpt - retainedBase,
    citations: [
      { code: "OECD MC Art. 10", title: "Dividends", article: "Beneficial-ownership and WHT reduction" },
      { code: `${req.origin}-CH DTA`, title: "Double Tax Agreement", article: "Article 10 §2" },
      { code: `CH-${req.destination} DTA`, title: "Double Tax Agreement", article: "Article 10 §2" },
    ],
  };
}

const RUN_CACHE = new Map<string, SimulationResponse>();

export async function runSimulation(req: SimulationRequest): Promise<SimulationResponse> {
  const res = await api.post<SimulationResponse>("/api/simulate", req as unknown as Record<string, unknown>, {
    mock: () => mockSimulate(req),
  });
  if (IS_MOCK_API) RUN_CACHE.set(res.runId, res);
  return res;
}

export async function getRun(runId: string): Promise<SimulationResponse> {
  return api.get<SimulationResponse>(`/api/runs/${runId}`, {
    mock: () => {
      const hit = RUN_CACHE.get(runId);
      if (hit) return hit;
      // Fall back to a fresh mock so deep links don't 404 in preview.
      const fresh = mockSimulate({
        scenarioId: "corporate_dividend",
        origin: "US",
        destination: "SG",
        amount: 1_000_000,
      });
      const withId = { ...fresh, runId };
      RUN_CACHE.set(runId, withId);
      return withId;
    },
  });
}
