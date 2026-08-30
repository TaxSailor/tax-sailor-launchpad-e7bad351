// Ranked alternates for a computed run. Fetched on request so the results page
// stays fast and the extra call only happens when the user asks for it.

import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  runTopPaths,
  type PathResult,
  type ScenarioDef,
  type ScenarioInput,
} from "@/lib/workspace/scenarios";
import { flagFor } from "@/lib/workspace/jurisdictions";

export function AlternateRoutes({
  scenario,
  input,
  currentPath,
}: {
  scenario: ScenarioDef;
  input: ScenarioInput;
  currentPath: string[];
}) {
  const [paths, setPaths] = useState<PathResult[] | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await runTopPaths(scenario, input, 10);
      setPaths(res.paths ?? []);
      setTotal(res.total_paths_found ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load alternate routes.");
    } finally {
      setLoading(false);
    }
  }

  const currentKey = currentPath.join(">");

  return (
    <section className="mt-8 rounded-sm border border-navy/10 bg-white p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-teal">
            Alternate routes
          </p>
          <h2 className="mt-1 font-serif text-xl text-navy">Ranked corridor options</h2>
          <p className="mt-1 text-sm text-navy/65">
            Compare the next best routes for the same corridor, with retained share and hop count
            for each.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-sm border border-teal/50 bg-white px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-teal hover:bg-teal hover:text-white disabled:opacity-50"
        >
          {loading && <Loader2 className="size-3 animate-spin" />}
          {paths ? "Refresh" : "Compare routes"}
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-sm border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          {error}
        </p>
      )}

      {paths && paths.length === 0 && !error && (
        <p className="mt-4 text-sm text-navy/60">
          No alternate route was found for this corridor.
        </p>
      )}

      {paths && paths.length > 0 && (
        <>
          {total != null && (
            <p className="mt-4 font-mono text-[11px] text-navy/55">
              {total} route{total === 1 ? "" : "s"} found, showing {paths.length}.
            </p>
          )}
          <ul className="mt-3 divide-y divide-navy/5">
            {paths.map((p) => {
              const isCurrent = p.path.join(">") === currentKey;
              const retained =
                p.retained_earnings_pct != null
                  ? `${p.retained_earnings_pct.toFixed(2)}%`
                  : (p.retained_pct_masked ?? p.retained_pct_band ?? "locked");
              const hops = p.hops ?? p.hop_count ?? Math.max(0, p.path.length - 1);
              return (
                <li key={`${p.rank}-${p.path.join("-")}`} className="py-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <span className="font-mono text-[11px] uppercase tracking-widest text-navy/50">
                      Rank {p.rank}
                      {isCurrent && <span className="ml-2 text-teal">Current route</span>}
                    </span>
                    <span className="font-mono text-sm text-teal">{retained} retained</span>
                  </div>
                  <p className="mt-1 text-sm text-navy">
                    {p.path.map((name, i) => (
                      <span key={`${name}-${i}`}>
                        <span aria-hidden="true">{flagFor(name)}</span> {name}
                        {i < p.path.length - 1 && <span className="text-navy/40"> &gt; </span>}
                      </span>
                    ))}
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-navy/55">
                    {hops} hop{hops === 1 ? "" : "s"} ·{" "}
                    {p.uses_statutory_edges ? "includes statutory edges" : "treaty edges only"}
                    {p.compliance_warnings.length > 0 &&
                      ` · ${p.compliance_warnings.length} compliance note${
                        p.compliance_warnings.length === 1 ? "" : "s"
                      }`}
                  </p>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
