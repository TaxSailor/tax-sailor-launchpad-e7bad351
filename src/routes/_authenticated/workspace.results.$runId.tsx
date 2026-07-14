import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getRun, type SimulationResponse, type RouteHop } from "@/lib/workspace/scenarios";

export const Route = createFileRoute("/_authenticated/workspace/results/$runId")({
  head: ({ params }) => ({
    meta: [
      { title: `Run ${params.runId} — TaxSailor` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResultsPage,
});

function ResultsPage() {
  const { runId } = Route.useParams();
  const [data, setData] = useState<SimulationResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getRun(runId)
      .then((r) => !cancelled && setData(r))
      .catch((e) => !cancelled && setErr(e instanceof Error ? e.message : String(e)));
    return () => {
      cancelled = true;
    };
  }, [runId]);

  if (err) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="font-mono text-[11px] uppercase tracking-widest text-red-600">Error</p>
        <h1 className="mt-2 font-serif text-3xl text-navy">Run unavailable</h1>
        <p className="mt-2 text-sm text-navy/60">{err}</p>
        <Link to="/workspace" className="mt-6 inline-block font-mono text-sm text-teal">
          ← Back to scenarios
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-32 bg-navy/10" />
          <div className="h-10 w-96 bg-navy/10" />
          <div className="h-64 bg-navy/5" />
        </div>
      </div>
    );
  }

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  const pct = (n: number) => `${(n * 100).toFixed(2)}%`;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <Link to="/workspace" className="font-mono text-[11px] uppercase tracking-widest text-teal">
            ← Scenarios
          </Link>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-widest text-navy/50">
            Run {data.runId}
          </p>
          <h1 className="mt-1 font-serif text-3xl text-navy md:text-4xl">Optimisation result</h1>
        </div>
        <div className="text-right">
          <p className="font-mono text-[10px] uppercase tracking-widest text-navy/50">
            Retained after tax
          </p>
          <p className="mt-1 font-serif text-3xl text-teal">{fmt(data.optimal.retained)}</p>
          <p className="mt-1 font-mono text-[11px] text-navy/60">
            +{fmt(data.savings)} vs. baseline
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <RouteCard title="Optimal route" hops={data.optimal.hops} accent="teal" />
        <RouteCard title="Baseline route" hops={data.baseline.hops} accent="navy" />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Effective tax (optimal)" value={pct(data.optimal.effectiveTax)} accent="teal" />
        <Stat label="Effective tax (baseline)" value={pct(data.baseline.effectiveTax)} />
        <Stat
          label="Route weight W = −ln(1−τ)"
          value={data.optimal.weight.toFixed(4)}
          mono
        />
      </div>

      <div className="mt-10 rounded-sm border border-navy/10 bg-white p-6">
        <p className="font-mono text-[11px] uppercase tracking-widest text-teal">Legal evidence</p>
        <h2 className="mt-2 font-serif text-xl text-navy">Citations backing this route</h2>
        <ul className="mt-4 divide-y divide-navy/5">
          {data.citations.map((c) => (
            <li key={c.code} className="grid gap-1 py-3 md:grid-cols-[160px_1fr_1fr]">
              <span className="font-mono text-[11px] uppercase tracking-widest text-navy/60">
                {c.code}
              </span>
              <span className="text-sm text-navy">{c.title}</span>
              <span className="text-sm text-navy/60">{c.article}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          onClick={() => window.print()}
          className="rounded-sm border border-navy/15 bg-white px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-navy hover:border-navy"
        >
          Export PDF
        </button>
        <Link
          to="/workspace"
          className="rounded-sm bg-navy px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-white hover:bg-teal"
        >
          New scenario →
        </Link>
      </div>
    </div>
  );
}

function RouteCard({
  title,
  hops,
  accent = "navy",
}: {
  title: string;
  hops: RouteHop[];
  accent?: "teal" | "navy";
}) {
  const border = accent === "teal" ? "border-teal" : "border-navy/15";
  const chip = accent === "teal" ? "text-teal" : "text-navy/60";
  return (
    <div className={`rounded-sm border-2 ${border} bg-white p-6`}>
      <p className={`font-mono text-[11px] uppercase tracking-widest ${chip}`}>{title}</p>
      <div className="mt-5 space-y-3">
        {hops.map((h, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-navy/15 bg-white text-lg">
              {h.flag}
            </div>
            <div className="flex-1 border-b border-navy/5 pb-2">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-sm font-semibold text-navy">{h.jurisdiction}</span>
                <span className="font-mono text-[11px] text-navy/60">
                  τ = {(h.edgeTax * 100).toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-navy/60">{h.note}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
  mono,
}: {
  label: string;
  value: string;
  accent?: "teal";
  mono?: boolean;
}) {
  return (
    <div className="rounded-sm border border-navy/10 bg-white p-5">
      <p className="font-mono text-[10px] uppercase tracking-widest text-navy/50">{label}</p>
      <p
        className={`mt-2 ${mono ? "font-mono text-xl" : "font-serif text-2xl"} ${
          accent === "teal" ? "text-teal" : "text-navy"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
