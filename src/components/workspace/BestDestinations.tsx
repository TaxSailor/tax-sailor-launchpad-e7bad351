// Destination scan for a run: keeps the origin and profile fixed and ranks the
// destinations that retain the most after tax.

import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  runBestDestinations,
  type BestDestination,
  type ScenarioDef,
  type ScenarioInput,
} from "@/lib/workspace/scenarios";
import { flagFor } from "@/lib/workspace/jurisdictions";

export function BestDestinations({
  scenario,
  input,
}: {
  scenario: ScenarioDef;
  input: ScenarioInput;
}) {
  const [rows, setRows] = useState<BestDestination[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await runBestDestinations(scenario, input, 8);
      setRows(res.destinations ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not scan destinations.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-6 rounded-sm border border-navy/10 bg-white p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-teal">
            Destination scan
          </p>
          <h2 className="mt-1 font-serif text-xl text-navy">
            Where this profile retains the most
          </h2>
          <p className="mt-1 text-sm text-navy/65">
            Same origin and profile, ranked across candidate destinations.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-sm border border-navy/20 bg-white px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-navy hover:border-teal hover:text-teal disabled:opacity-50"
        >
          {loading && <Loader2 className="size-3 animate-spin" />}
          {rows ? "Rescan" : "Scan destinations"}
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-sm border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          {error}
        </p>
      )}

      {rows && rows.length === 0 && !error && (
        <p className="mt-4 text-sm text-navy/60">No routable destination was returned.</p>
      )}

      {rows && rows.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="font-mono text-[10px] uppercase tracking-widest text-navy/50">
              <tr>
                <th className="pb-2 pr-4">Destination</th>
                <th className="pb-2 pr-4">Retained</th>
                <th className="pb-2 pr-4">Hops</th>
                <th className="pb-2">Route</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {rows.map((d) => (
                <tr key={d.destination}>
                  <td className="py-2 pr-4 text-xs text-navy">
                    <span aria-hidden="true">{flagFor(d.destination)}</span> {d.destination}
                  </td>
                  <td className="py-2 pr-4 font-mono text-xs text-teal">
                    {d.retained_earnings_pct != null
                      ? `${d.retained_earnings_pct.toFixed(2)}%`
                      : (d.retained_pct_band ?? "locked")}
                  </td>
                  <td className="py-2 pr-4 font-mono text-xs text-navy/60">
                    {d.hops ?? Math.max(0, d.path.length - 1)}
                  </td>
                  <td className="py-2 text-xs text-navy/70">
                    {d.routable ? d.path.join(" > ") : "Not routable with current data"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
