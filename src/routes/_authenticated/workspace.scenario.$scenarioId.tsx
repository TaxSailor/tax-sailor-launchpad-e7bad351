import { createFileRoute, useNavigate, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  getScenario,
  runSimulation,
  type FamilyStatus,
  type RiskAppetite,
} from "@/lib/workspace/scenarios";
import {
  cachedJurisdictions,
  loadJurisdictions,
  type Jurisdiction,
} from "@/lib/workspace/jurisdictions";
import { JurisdictionSelect } from "@/components/workspace/JurisdictionSelect";

type Search = { from?: string; to?: string; amount?: number };

export const Route = createFileRoute("/_authenticated/workspace/scenario/$scenarioId")({
  head: ({ params }) => {
    const s = getScenario(params.scenarioId);
    return {
      meta: [
        { title: `${s?.title ?? "Scenario"} — Workspace · TaxSailor` },
        { name: "robots", content: "noindex" },
      ],
    };
  },
  validateSearch: (search: Record<string, unknown>): Search => ({
    from: typeof search.from === "string" ? search.from : undefined,
    to: typeof search.to === "string" ? search.to : undefined,
    amount: Number.isFinite(Number(search.amount)) && search.amount !== undefined
      ? Number(search.amount)
      : undefined,
  }),
  loader: ({ params }) => {
    if (!getScenario(params.scenarioId)) throw notFound();
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <p className="font-mono text-[11px] uppercase tracking-widest text-teal">404</p>
      <h1 className="mt-2 font-serif text-3xl text-navy">Scenario not found</h1>
      <Link to="/workspace" className="mt-6 inline-block font-mono text-sm text-teal">
        Back to scenarios
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <p className="font-mono text-[11px] uppercase tracking-widest text-red-600">Error</p>
      <h1 className="mt-2 font-serif text-3xl text-navy">Something went wrong</h1>
      <p className="mt-2 text-sm text-navy/60">{error.message}</p>
    </div>
  ),
  component: ScenarioPage,
});

const FAMILY_OPTIONS: Array<{ value: FamilyStatus; label: string }> = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "married_with_children", label: "Married with children" },
  { value: "single_with_children", label: "Single with children" },
];

const RISK_OPTIONS: Array<{ value: RiskAppetite; label: string; hint: string }> = [
  { value: "low", label: "Low", hint: "Exclude routes with GAAR, CFC or PE exposure" },
  { value: "medium", label: "Medium", hint: "Include flagged routes with warnings" },
  { value: "high", label: "High", hint: "Include all routes the graph can reach" },
];

function ScenarioPage() {
  const { scenarioId } = Route.useParams();
  const search = Route.useSearch();
  const scenario = getScenario(scenarioId)!; // loader 404s on unknown ids
  const navigate = useNavigate();

  const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>(cachedJurisdictions());
  const [origin, setOrigin] = useState(search.from ?? scenario.defaultOrigin);
  const [destination, setDestination] = useState(search.to ?? scenario.defaultDestination);
  const [amount, setAmount] = useState(search.amount ?? scenario.defaultAmount);
  const [familyStatus, setFamilyStatus] = useState<FamilyStatus>("single");
  const [residencyYears, setResidencyYears] = useState(5);
  const [numDependents, setNumDependents] = useState(0);
  const [riskAppetite, setRiskAppetite] = useState<RiskAppetite>("medium");
  const [hasLocalSubstance, setHasLocalSubstance] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadJurisdictions().then(setJurisdictions).catch(() => undefined);
  }, []);

  const isIndividual = scenario.perspective === "individual";
  const isInheritance = scenario.mode.startsWith("inheritance");
  const isCorporate = scenario.perspective === "corporate";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const run = await runSimulation(scenario, {
        origin,
        destination,
        amount,
        riskAppetite,
        ...(isIndividual || isInheritance ? { familyStatus } : {}),
        ...(isIndividual ? { residencyYears } : {}),
        ...(isInheritance ? { numDependents } : {}),
        ...(isCorporate ? { hasLocalSubstance } : {}),
      });
      navigate({ to: "/workspace/results/$runId", params: { runId: run.runId } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "The simulation could not be completed.");
      setSubmitting(false);
    }
  }

  function swap() {
    setOrigin(destination);
    setDestination(origin);
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 md:py-16">
      <Link
        to="/workspace"
        className="inline-flex min-h-11 items-center font-mono text-[11px] uppercase tracking-widest text-teal"
      >
        Scenarios
      </Link>

      <header className="mt-4">
        <p className="font-mono text-[11px] uppercase tracking-widest text-navy/50">
          {scenario.audience} · Step 2 of 2
        </p>
        <h1 className="mt-2 font-serif text-3xl text-navy md:text-4xl">{scenario.title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-navy/70">{scenario.summary}</p>
      </header>

      <form
        onSubmit={submit}
        className="mt-8 grid gap-8 rounded-sm border border-navy/10 bg-white p-6 md:mt-10 md:p-8"
      >
        <section className="grid gap-4">
          <SectionTitle index="01" title="Corridor" />
          <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-end">
            <JurisdictionSelect
              id="origin"
              label={scenario.originLabel}
              value={origin}
              onChange={setOrigin}
              options={jurisdictions}
            />
            <button
              type="button"
              onClick={swap}
              aria-label="Swap origin and destination"
              className="min-h-11 self-end rounded-sm border border-navy/15 px-3 py-2.5 font-mono text-xs text-navy/60 transition-colors hover:border-teal hover:text-teal"
            >
              swap
            </button>
            <JurisdictionSelect
              id="destination"
              label={scenario.destinationLabel}
              value={destination}
              onChange={setDestination}
              options={jurisdictions}
            />
          </div>
        </section>

        <section className="grid gap-4 border-t border-navy/5 pt-6">
          <SectionTitle index="02" title="Scale" />
          <Field label={`${scenario.scaleLabel} (${scenario.scaleUnit})`} htmlFor="amount">
            <input
              id="amount"
              type="number"
              min={0}
              step={10000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="min-h-11 w-full rounded-sm border border-navy/15 bg-white px-3 py-2.5 font-mono text-sm text-navy focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20"
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            {[250_000, 1_000_000, 5_000_000, 25_000_000].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setAmount(v)}
                className={`min-h-11 rounded-sm border px-3 py-1.5 font-mono text-[11px] ${
                  amount === v
                    ? "border-teal bg-teal text-white"
                    : "border-navy/15 text-navy/70 hover:border-navy/40"
                }`}
              >
                {v.toLocaleString("en-US")}
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-6 border-t border-navy/5 pt-6">
          <SectionTitle index="03" title="Profile" />
          {(isIndividual || isInheritance) && (
            <Field label="Family status">
              <div className="flex flex-wrap gap-2">
                {FAMILY_OPTIONS.map((o) => (
                  <button
                    type="button"
                    key={o.value}
                    aria-pressed={familyStatus === o.value}
                    onClick={() => setFamilyStatus(o.value)}
                    className={`min-h-11 rounded-sm border px-3 py-1.5 text-xs ${
                      familyStatus === o.value
                        ? "border-teal bg-teal text-white"
                        : "border-navy/15 text-navy/70 hover:border-navy/40"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </Field>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {isIndividual && (
              <Field label="Years tax-resident in origin" htmlFor="residency">
                <input
                  id="residency"
                  type="number"
                  min={0}
                  max={99}
                  value={residencyYears}
                  onChange={(e) => setResidencyYears(Number(e.target.value))}
                  className="min-h-11 w-full rounded-sm border border-navy/15 bg-white px-3 py-2.5 font-mono text-sm text-navy focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20"
                />
              </Field>
            )}
            {isInheritance && (
              <Field label="Dependents" htmlFor="dependents">
                <input
                  id="dependents"
                  type="number"
                  min={0}
                  max={20}
                  value={numDependents}
                  onChange={(e) => setNumDependents(Number(e.target.value))}
                  className="min-h-11 w-full rounded-sm border border-navy/15 bg-white px-3 py-2.5 font-mono text-sm text-navy focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20"
                />
              </Field>
            )}
            {isCorporate && (
              <Field label="Local substance in destination">
                <div className="flex gap-2">
                  {[
                    { v: true, l: "Office and staff planned" },
                    { v: false, l: "No local presence" },
                  ].map((o) => (
                    <button
                      key={String(o.v)}
                      type="button"
                      aria-pressed={hasLocalSubstance === o.v}
                      onClick={() => setHasLocalSubstance(o.v)}
                      className={`min-h-11 rounded-sm border px-3 py-1.5 text-xs ${
                        hasLocalSubstance === o.v
                          ? "border-teal bg-teal text-white"
                          : "border-navy/15 text-navy/70 hover:border-navy/40"
                      }`}
                    >
                      {o.l}
                    </button>
                  ))}
                </div>
              </Field>
            )}
          </div>

          <Field label="Risk appetite">
            <div className="grid gap-2 sm:grid-cols-3">
              {RISK_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  aria-pressed={riskAppetite === o.value}
                  onClick={() => setRiskAppetite(o.value)}
                  className={`rounded-sm border p-3 text-left ${
                    riskAppetite === o.value
                      ? "border-teal bg-teal/5"
                      : "border-navy/15 hover:border-navy/40"
                  }`}
                >
                  <span className="block font-mono text-[11px] uppercase tracking-widest text-navy">
                    {o.label}
                  </span>
                  <span className="mt-1 block text-xs leading-snug text-navy/60">{o.hint}</span>
                </button>
              ))}
            </div>
          </Field>
        </section>

        <div className="flex flex-col gap-4 border-t border-navy/5 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] text-navy/50">{scenario.math}</p>
          <button
            type="submit"
            disabled={submitting}
            className="min-h-11 rounded-sm bg-navy px-5 py-2.5 font-mono text-[11px] uppercase tracking-widest text-white transition hover:bg-teal disabled:opacity-50"
          >
            {submitting ? "Computing route" : "Run optimisation"}
          </button>
        </div>
        {error && (
          <p role="alert" className="rounded-sm border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}

function SectionTitle({ index, title }: { index: string; title: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="font-mono text-[11px] text-teal">{index}</span>
      <h2 className="font-serif text-xl text-navy">{title}</h2>
    </div>
  );
}

function Field({
  label,
  children,
  htmlFor,
}: {
  label: string;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="block">
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-navy/60"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
