import { createFileRoute, useNavigate, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { getScenario, runSimulation, type ScenarioId } from "@/lib/workspace/scenarios";

export const Route = createFileRoute("/_authenticated/workspace/scenario/$scenarioId")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.scenarioId} — Workspace · TaxSailor` },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: ({ params }) => {
    const s = getScenario(params.scenarioId);
    if (!s) throw notFound();
    return { scenario: s };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <p className="font-mono text-[11px] uppercase tracking-widest text-teal">404</p>
      <h1 className="mt-2 font-serif text-3xl text-navy">Scenario not found</h1>
      <Link to="/workspace" className="mt-6 inline-block font-mono text-sm text-teal">
        ← Back to scenarios
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

const JURISDICTIONS = ["US", "DE", "CH", "SG", "LU", "IE", "AE"] as const;

function ScenarioPage() {
  const { scenario } = Route.useLoaderData();
  const navigate = useNavigate();
  const [origin, setOrigin] = useState<string>("US");
  const [destination, setDestination] = useState<string>("SG");
  const [amount, setAmount] = useState<number>(1_000_000);
  const [familyStatus, setFamilyStatus] = useState<"single" | "married" | "family">("single");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await runSimulation({
        scenarioId: scenario.id as ScenarioId,
        origin,
        destination,
        amount,
        familyStatus,
      });
      navigate({ to: "/workspace/results/$runId", params: { runId: res.runId } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run simulation");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
      <Link to="/workspace" className="font-mono text-[11px] uppercase tracking-widest text-teal">
        ← Scenarios
      </Link>
      <p className="mt-6 font-mono text-[11px] uppercase tracking-widest text-navy/50">
        {scenario.audience} · Step 2 of 2
      </p>
      <h1 className="mt-2 font-serif text-3xl text-navy md:text-4xl">{scenario.title}</h1>
      <p className="mt-2 max-w-xl text-sm text-navy/70">{scenario.summary}</p>

      <form onSubmit={submit} className="mt-10 grid gap-6 rounded-sm border border-navy/10 bg-white p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-2">
          <Field label={scenario.originLabel}>
            <Select value={origin} onChange={setOrigin} />
          </Field>
          <Field label={scenario.destinationLabel}>
            <Select value={destination} onChange={setDestination} />
          </Field>
        </div>

        <Field label={`${scenario.scaleLabel} (${scenario.scaleUnit})`}>
          <input
            type="number"
            min={0}
            step={1000}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full rounded-sm border border-navy/15 bg-white px-3 py-2.5 font-mono text-sm text-navy focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20"
          />
        </Field>

        {(scenario.id === "wealth_transfer" || scenario.id === "inheritance") && (
          <Field label="Family status">
            <div className="flex gap-2">
              {(["single", "married", "family"] as const).map((v) => (
                <button
                  type="button"
                  key={v}
                  onClick={() => setFamilyStatus(v)}
                  className={`rounded-sm border px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest ${
                    familyStatus === v
                      ? "border-teal bg-teal text-white"
                      : "border-navy/15 text-navy/70 hover:border-navy/40"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </Field>
        )}

        <div className="mt-2 flex items-center justify-between border-t border-navy/5 pt-4">
          <p className="font-mono text-[11px] text-navy/50">{scenario.math}</p>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-sm bg-navy px-5 py-2.5 font-mono text-[11px] uppercase tracking-widest text-white transition hover:bg-teal disabled:opacity-50"
          >
            {submitting ? "Computing…" : "Run optimisation →"}
          </button>
        </div>
        {error && <p className="font-mono text-xs text-red-600">{error}</p>}
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-navy/60">
        {label}
      </span>
      {children}
    </label>
  );
}

function Select({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-sm border border-navy/15 bg-white px-3 py-2.5 font-mono text-sm text-navy focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20"
    >
      {JURISDICTIONS.map((j) => (
        <option key={j} value={j}>
          {j}
        </option>
      ))}
    </select>
  );
}
