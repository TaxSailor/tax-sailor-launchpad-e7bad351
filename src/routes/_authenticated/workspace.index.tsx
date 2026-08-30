import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SCENARIOS, listRecentRuns, type WorkspaceRun } from "@/lib/workspace/scenarios";
import { flagFor } from "@/lib/workspace/jurisdictions";
import { listRuns, type SavedRunSummary } from "@/lib/workspace/account";
import { useSession } from "@/lib/auth/session";

export const Route = createFileRoute("/_authenticated/workspace/")({
  head: () => ({
    meta: [
      { title: "Workspace — TaxSailor" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WorkspacePage,
});

type Filter = "all" | "Corporate" | "Individual";

function WorkspacePage() {
  const { user } = useSession();
  const [filter, setFilter] = useState<Filter>("all");
  const [recent, setRecent] = useState<WorkspaceRun[]>([]);
  const [saved, setSaved] = useState<SavedRunSummary[]>([]);

  useEffect(() => {
    setRecent(listRecentRuns());
    listRuns()
      .then((r) => setSaved(r.runs.slice(0, 6)))
      .catch(() => undefined);
  }, []);

  const visible = SCENARIOS.filter((s) => filter === "all" || s.audience === filter);
  const firstName = user?.name ? user.name.split(" ")[0] : null;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 md:py-16">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-teal">Workspace</p>
          <h1 className="mt-2 font-serif text-3xl text-navy md:text-4xl">
            {firstName ? `What are you optimising, ${firstName}?` : "What are you optimising?"}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-navy/70">
            Pick a scenario. Each run is routed across 125 jurisdictions, 407 treaty edges and
            4,789 statutory edges, and returns a comparable, evidenced route.
          </p>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter scenarios">
          {(["all", "Corporate", "Individual"] as const).map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={`min-h-11 rounded-sm border px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest ${
                filter === f
                  ? "border-teal bg-teal text-white"
                  : "border-navy/15 text-navy/70 hover:border-navy/40"
              }`}
            >
              {f === "all" ? "All" : f}
            </button>
          ))}
        </div>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((s) => (
          <Link
            key={s.id}
            to="/workspace/scenario/$scenarioId"
            params={{ scenarioId: s.id }}
            className="group flex flex-col rounded-sm border border-navy/10 bg-white p-6 transition hover:border-teal hover:shadow-[0_4px_20px_rgba(5,35,71,0.08)]"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-teal">
                {s.audience}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-navy/40 group-hover:text-navy">
                Configure
              </span>
            </div>
            <p className="mt-3 font-serif text-xl text-navy">{s.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-navy/60">{s.summary}</p>
            <p className="mt-4 font-mono text-[11px] text-navy/50">
              <span aria-hidden="true">{flagFor(s.defaultOrigin)}</span> {s.defaultOrigin}
              {" to "}
              <span aria-hidden="true">{flagFor(s.defaultDestination)}</span> {s.defaultDestination}
            </p>
            <p className="mt-3 border-t border-navy/5 pt-3 font-mono text-[11px] text-navy/50">
              {s.math}
            </p>
          </Link>
        ))}
      </div>

      {recent.length > 0 && (
        <section className="mt-14">
          <h2 className="font-serif text-2xl text-navy">This session</h2>
          <p className="mt-1 text-sm text-navy/60">
            Snapshots held in this browser tab. Open one to review the route and exports.
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {recent.map((r) => (
              <li key={r.runId}>
                <Link
                  to="/workspace/results/$runId"
                  params={{ runId: r.runId }}
                  className="flex min-h-11 items-center justify-between gap-4 rounded-sm border border-navy/10 bg-white px-4 py-3 transition hover:border-teal"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-navy">{r.scenarioLabel}</span>
                    <span className="mt-0.5 block truncate font-mono text-[11px] text-navy/55">
                      {flagFor(r.input.origin)} {r.input.origin} to {flagFor(r.input.destination)}{" "}
                      {r.input.destination}
                    </span>
                  </span>
                  <span className="whitespace-nowrap font-mono text-sm text-teal">
                    {r.retained_earnings_pct != null
                      ? `${r.retained_earnings_pct.toFixed(1)}%`
                      : (r.retained_pct_band ?? "locked")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl text-navy">Saved runs</h2>
            <p className="mt-1 text-sm text-navy/60">
              Runs stored on your account, available on any device.
            </p>
          </div>
          <Link
            to="/account"
            className="min-h-11 whitespace-nowrap font-mono text-[11px] uppercase tracking-widest text-teal"
          >
            Account
          </Link>
        </div>
        {saved.length === 0 ? (
          <p className="mt-4 rounded-sm border border-dashed border-navy/15 bg-ghost p-6 text-sm text-navy/60">
            No saved runs yet. Run a scenario and it appears here.
          </p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {saved.map((r) => (
              <li key={r.id}>
                <Link
                  to="/workspace/results/$runId"
                  params={{ runId: r.id }}
                  className="flex min-h-11 items-center justify-between gap-4 rounded-sm border border-navy/10 bg-white px-4 py-3 transition hover:border-teal"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-navy">{r.scenario_label}</span>
                    <span className="mt-0.5 block truncate font-mono text-[11px] text-navy/55">
                      {r.origin} to {r.destination} ·{" "}
                      {new Date(r.created_at).toLocaleDateString("en-GB")}
                    </span>
                  </span>
                  <span className="whitespace-nowrap font-mono text-sm text-teal">
                    {r.retained_pct === null ? "Gated" : `${r.retained_pct.toFixed(1)}%`}
                  </span>

                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
