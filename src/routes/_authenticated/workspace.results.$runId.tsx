import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  downloadText,
  fetchExportXml,
  getCachedRun,
  getScenario,
  loadRunFromAccount,
  type ExportKind,
  type PathEdgeDetail,
  type SimulationRequestPayload,
  type WorkspaceRun,
} from "@/lib/workspace/scenarios";
import { AlternateRoutes } from "@/components/workspace/AlternateRoutes";
import { BestDestinations } from "@/components/workspace/BestDestinations";
import { flagFor } from "@/lib/workspace/jurisdictions";


export const Route = createFileRoute("/_authenticated/workspace/results/$runId")({
  head: () => ({
    meta: [
      { title: "Optimisation result — Workspace · TaxSailor" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResultsPage,
});

function ResultsPage() {
  const { runId } = Route.useParams();
  const [data, setData] = useState<WorkspaceRun | null>(() => getCachedRun(runId));
  const [loading, setLoading] = useState(!data);

  useEffect(() => {
    const cached = getCachedRun(runId);
    if (cached) {
      setData(cached);
      setLoading(false);
      return;
    }
    setLoading(true);
    loadRunFromAccount(runId)
      .then((r) => setData(r))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [runId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="font-mono text-[11px] uppercase tracking-widest text-teal">Loading run</p>
        <div className="mx-auto mt-6 h-1 w-40 overflow-hidden rounded-full bg-navy/10">
          <div className="h-full w-1/2 animate-pulse bg-teal" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="font-mono text-[11px] uppercase tracking-widest text-navy/50">
          Run unavailable
        </p>
        <h1 className="mt-2 font-serif text-3xl text-navy">This run is no longer available</h1>
        <p className="mt-2 text-sm text-navy/60">
          Session snapshots are held in this browser tab only. Run the scenario again to see a fresh
          result, or open a run saved on your account.
        </p>
        <Link
          to="/workspace"
          className="mt-6 inline-flex min-h-11 items-center rounded-sm bg-navy px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-white hover:bg-teal"
        >
          Back to scenarios
        </Link>
      </div>
    );
  }

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  const pct = (n: number | null | undefined, masked?: string | null) =>
    n == null ? (masked ?? "locked") : `${n.toFixed(2)}%`;

  const retainedPct = data.retained_earnings_pct ?? null;
  const retainedAmount = retainedPct != null ? (retainedPct / 100) * data.amount : null;
  const path = data.optimal_path ?? [];
  const hops = data.hop_count ?? Math.max(0, path.length - 1);
  const verified = data.best_label_eligible !== false && !data.uses_statutory_edges;
  const scenario = getScenario(data.scenarioId);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 md:py-16">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <Link
            to="/workspace"
            className="inline-flex min-h-11 items-center font-mono text-[11px] uppercase tracking-widest text-teal"
          >
            Scenarios
          </Link>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-navy/50">
            {data.scenarioLabel} · Run {data.runId.slice(0, 8)}
          </p>
          <h1 className="mt-1 font-serif text-3xl text-navy md:text-4xl">Optimisation result</h1>
          <p className="mt-2 font-mono text-[11px] text-navy/55">
            {verified ? "Treaty edges only" : "Includes statutory edges"} ·{" "}
            {data.entitlement_tier ? `tier ${data.entitlement_tier}` : "tier resolved server-side"}
          </p>
        </div>
        <div className="md:text-right">
          <p className="font-mono text-[10px] uppercase tracking-widest text-navy/50">
            Retained after tax
          </p>
          <p className="mt-1 font-serif text-3xl text-teal">
            {retainedAmount != null ? fmt(retainedAmount) : (data.savings_band_eur ?? "Locked")}
          </p>
          <p className="mt-1 font-mono text-[11px] text-navy/60">
            {retainedPct != null
              ? `${retainedPct.toFixed(2)}% of ${fmt(data.amount)}`
              : (data.retained_pct_band ?? data.teaser_headline ?? "Locked preview")}
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-sm border-2 border-teal bg-white p-6">
        <p className="font-mono text-[11px] uppercase tracking-widest text-teal">Optimal route</p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {path.length === 0 ? (
            <span className="font-mono text-xs text-navy/60">No route computed.</span>
          ) : (
            path.map((name, i) => (
              <div key={`${name}-${i}`} className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-navy/15 bg-ghost px-3 py-1.5 text-sm text-navy">
                  <span aria-hidden="true">{flagFor(name)}</span>
                  <span>{name}</span>
                </span>
                {i < path.length - 1 && (
                  <span aria-hidden="true" className="font-mono text-navy/40">
                    &gt;
                  </span>
                )}
              </div>
            ))
          )}
        </div>
        {data.optimality_note && (
          <p className="mt-4 border-t border-navy/5 pt-3 font-mono text-[11px] text-navy/55">
            {data.optimality_note}
          </p>
        )}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat
          label="Retained"
          value={pct(data.retained_earnings_pct, data.retained_pct_masked)}
          accent="teal"
        />
        <Stat label="Tax leakage" value={pct(data.tax_leakage_pct, data.tax_leakage_pct_masked)} />
        <Stat label="Hops on path" value={String(hops)} mono />
      </div>

      {data.path_details && data.path_details.length > 0 && (
        <div className="mt-8 overflow-x-auto rounded-sm border border-navy/10 bg-white p-6">
          <p className="font-mono text-[11px] uppercase tracking-widest text-teal">
            Per-hop breakdown
          </p>
          <table className="mt-4 w-full min-w-[520px] text-left text-sm">
            <thead className="font-mono text-[10px] uppercase tracking-widest text-navy/50">
              <tr>
                <th className="pb-2 pr-4">From</th>
                <th className="pb-2 pr-4">To</th>
                <th className="pb-2 pr-4">Withholding</th>
                <th className="pb-2 pr-4">Edge</th>
                <th className="pb-2">Basis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {data.path_details.map((h: PathEdgeDetail, i) => (
                <tr key={i}>
                  <td className="py-2 pr-4 text-xs">
                    <span aria-hidden="true">{flagFor(h.from_jurisdiction)}</span>{" "}
                    {h.from_jurisdiction}
                  </td>
                  <td className="py-2 pr-4 text-xs">
                    <span aria-hidden="true">{flagFor(h.to_jurisdiction)}</span> {h.to_jurisdiction}
                  </td>
                  <td className="py-2 pr-4 font-mono text-xs">
                    {typeof h.wht_rate_pct === "number" ? `${h.wht_rate_pct.toFixed(2)}%` : "n/a"}
                  </td>
                  <td className="py-2 pr-4 font-mono text-xs text-navy/60">{h.edge_type}</td>
                  <td className="py-2 text-xs text-navy/70">
                    {h.is_statutory ? "Domestic statutory rate" : "Treaty rate"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(data.citation_teasers?.length ?? 0) > 0 && (
        <div className="mt-6 rounded-sm border border-navy/10 bg-white p-6">
          <p className="font-mono text-[11px] uppercase tracking-widest text-teal">Legal basis</p>
          <ul className="mt-3 space-y-2 text-sm text-navy/80">
            {data.citation_teasers!.map((c, i) => (
              <li key={i} className="flex flex-wrap items-baseline gap-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-navy/50">
                  {c.citation_type}
                </span>
                <span>{c.title}</span>
                {c.wht_rate_masked && (
                  <span className="font-mono text-xs text-navy/40">{c.wht_rate_masked}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {(data.compliance_warnings?.length ?? 0) > 0 && (
        <NoteBlock title="Compliance warnings" tone="warn" items={data.compliance_warnings} />
      )}
      {(data.statutory_edge_details?.length ?? 0) > 0 && (
        <NoteBlock title="Statutory edges used" tone="info" items={data.statutory_edge_details} />
      )}
      {(data.limitations?.length ?? 0) > 0 && (
        <NoteBlock title="Model limitations" tone="info" items={data.limitations ?? []} />
      )}
      {(data.data_gaps?.length ?? 0) > 0 && (
        <NoteBlock title="Data gaps" tone="info" items={data.data_gaps} />
      )}
      {(data.unmapped_jurisdictions?.length ?? 0) > 0 && (
        <NoteBlock
          title="Unmapped jurisdictions"
          tone="info"
          items={data.unmapped_jurisdictions.map((j) => `${flagFor(j)} ${j}`)}
        />
      )}

      {scenario && (
        <>
          <AlternateRoutes scenario={scenario} input={data.input} currentPath={path} />
          <BestDestinations scenario={scenario} input={data.input} />
        </>
      )}


      {data.compliance_pending_notice && (
        <p className="mt-6 rounded-sm border border-navy/10 bg-ghost p-4 font-mono text-[11px] leading-relaxed text-navy/70">
          {data.compliance_pending_notice}
        </p>
      )}

      {data.gated && (
        <div className="mt-10 rounded-sm border-2 border-teal/40 bg-teal/5 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-teal">
                Locked fields
              </p>
              <h2 className="mt-1 font-serif text-xl text-navy">
                {data.teaser_headline ?? "Unlock exact figures and the legal appendix"}
              </h2>
              <p className="mt-1 text-sm text-navy/70">
                Paid tiers return exact retained and leakage figures, alternate ranked routes,
                verified citations and export-ready deliverables.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/pricing"
                className="min-h-11 rounded-sm bg-navy px-4 py-2.5 font-mono text-[11px] uppercase tracking-widest text-white hover:bg-teal"
              >
                View plans
              </Link>
              <Link
                to="/account"
                className="min-h-11 rounded-sm border border-navy/20 bg-white px-4 py-2.5 font-mono text-[11px] uppercase tracking-widest text-navy hover:border-teal hover:text-teal"
              >
                Manage account
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <ExportButton
          label="OECD CbCR XML"
          kind="cbcr"
          filename={`cbcr_${data.runId}.xml`}
          inline={data.oecd_cbcr_xml ?? null}
          request={data.request}
        />
        <ExportButton
          label="GloBE GIR XML"
          kind="gir"
          filename={`gir_${data.runId}.xml`}
          inline={data.globe_gir_xml ?? null}
          request={data.request}
        />

        <button
          type="button"
          onClick={() => window.print()}
          className="min-h-11 rounded-sm border border-navy/15 bg-white px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-navy hover:border-navy"
        >
          Print report
        </button>
        <Link
          to="/workspace/scenario/$scenarioId"
          params={{ scenarioId: data.scenarioId }}
          search={{
            from: data.input.origin,
            to: data.input.destination,
            amount: data.amount,
          }}
          className="min-h-11 rounded-sm border border-teal/50 bg-white px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-teal hover:bg-teal hover:text-white"
        >
          Adjust inputs
        </Link>
        <Link
          to="/workspace"
          className="min-h-11 rounded-sm bg-navy px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-white hover:bg-teal"
        >
          New scenario
        </Link>
      </div>
    </div>
  );
}

function ExportButton({
  label,
  kind,
  filename,
  inline,
  request,
}: {
  label: string;
  kind: ExportKind;
  filename: string;
  inline: string | null;
  request: SimulationRequestPayload;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setError(null);
    if (inline) {
      downloadText(filename, inline);
      return;
    }
    setBusy(true);
    try {
      const xml = await fetchExportXml(kind, request);
      downloadText(filename, xml);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export unavailable on your plan.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex flex-col gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className="min-h-11 rounded-sm border border-teal/50 bg-white px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-teal hover:bg-teal hover:text-white disabled:opacity-50"
      >
        {busy ? "Preparing" : label}
      </button>
      {error && <span className="max-w-56 text-[11px] text-amber-800">{error}</span>}
    </span>
  );
}

function NoteBlock({
  title,
  tone,
  items,
}: {
  title: string;
  tone: "warn" | "info";
  items: string[];
}) {
  const styles =
    tone === "warn"
      ? "border-amber-300 bg-amber-50 text-amber-900"
      : "border-navy/15 bg-white text-navy/80";
  return (
    <div className={`mt-6 rounded-sm border p-5 ${styles}`}>
      <p className="font-mono text-[11px] uppercase tracking-widest">{title}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
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
