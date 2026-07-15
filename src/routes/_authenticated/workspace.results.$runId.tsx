import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { getCachedRun, flagEmoji, type WorkspaceRun, type PathEdgeDetail } from "@/lib/workspace/scenarios";

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
  const data = useMemo<WorkspaceRun | null>(() => getCachedRun(runId), [runId]);

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="font-mono text-[11px] uppercase tracking-widest text-red-600">Run unavailable</p>
        <h1 className="mt-2 font-serif text-3xl text-navy">
          This run isn't in this session's cache.
        </h1>
        <p className="mt-2 text-sm text-navy/60">
          Simulation snapshots are held in this browser tab only. Run the scenario again to view fresh results.
        </p>
        <Link
          to="/workspace"
          className="mt-6 inline-block rounded-sm bg-navy px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-white hover:bg-teal"
        >
          ← Back to scenarios
        </Link>
      </div>
    );
  }

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  const pct = (n: number | null | undefined) =>
    n == null ? "—" : `${n.toFixed(2)}%`;

  const retainedPct = data.retained_earnings_pct ?? null;
  const retainedAmount = retainedPct != null ? (retainedPct / 100) * data.amount : null;
  const path = data.optimal_path ?? [];

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <Link to="/workspace" className="font-mono text-[11px] uppercase tracking-widest text-teal">
            ← Scenarios
          </Link>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-widest text-navy/50">
            {data.scenarioLabel} · Run {data.runId.slice(0, 8)}
          </p>
          <h1 className="mt-1 font-serif text-3xl text-navy md:text-4xl">Optimisation result</h1>
        </div>
        <div className="text-right">
          <p className="font-mono text-[10px] uppercase tracking-widest text-navy/50">
            Retained after tax
          </p>
          <p className="mt-1 font-serif text-3xl text-teal">
            {retainedAmount != null ? fmt(retainedAmount) : "—"}
          </p>
          <p className="mt-1 font-mono text-[11px] text-navy/60">
            {retainedPct != null ? `${retainedPct.toFixed(2)}% of ${fmt(data.amount)}` : (data.teaser_headline ?? "Locked preview")}
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-sm border-2 border-teal bg-white p-6">
        <p className="font-mono text-[11px] uppercase tracking-widest text-teal">Optimal route</p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {path.length === 0 ? (
            <span className="font-mono text-xs text-navy/60">No route computed.</span>
          ) : (
            path.map((iso, i) => (
              <div key={`${iso}-${i}`} className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-navy/15 bg-ghost px-3 py-1.5 font-mono text-sm text-navy">
                  <span aria-hidden="true">{flagEmoji(iso)}</span>
                  <span>{iso}</span>
                </span>
                {i < path.length - 1 && (
                  <span className="font-mono text-navy/40">→</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Retained (τ_kept)" value={pct(data.retained_earnings_pct)} accent="teal" />
        <Stat label="Tax leakage (τ_lost)" value={pct(data.tax_leakage_pct)} />
        <Stat
          label="Hops on path"
          value={String(data.hop_count ?? Math.max(0, path.length - 1))}
          mono
        />
      </div>

      {data.path_details && data.path_details.length > 0 && (
        <div className="mt-8 rounded-sm border border-navy/10 bg-white p-6">
          <p className="font-mono text-[11px] uppercase tracking-widest text-teal">Per-hop breakdown</p>
          <table className="mt-4 w-full text-left text-sm">
            <thead className="font-mono text-[10px] uppercase tracking-widest text-navy/50">
              <tr>
                <th className="pb-2 pr-4">From</th>
                <th className="pb-2 pr-4">To</th>
                <th className="pb-2 pr-4">WHT / rate</th>
                <th className="pb-2 pr-4">Edge</th>
                <th className="pb-2">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {data.path_details.map((h: PathEdgeDetail, i) => (
                <tr key={i}>
                  <td className="py-2 pr-4 font-mono text-xs">
                    {h.from_country ? `${flagEmoji(String(h.from_country))} ${h.from_country}` : "—"}
                  </td>
                  <td className="py-2 pr-4 font-mono text-xs">
                    {h.to_country ? `${flagEmoji(String(h.to_country))} ${h.to_country}` : "—"}
                  </td>
                  <td className="py-2 pr-4 font-mono text-xs">
                    {typeof h.wht_rate === "number" ? `${h.wht_rate.toFixed(2)}%` : "—"}
                  </td>
                  <td className="py-2 pr-4 font-mono text-xs text-navy/60">
                    {String(h.edge_type ?? "—")}
                  </td>
                  <td className="py-2 text-xs text-navy/70">{String(h.note ?? "")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(data.compliance_warnings?.length ?? 0) > 0 && (
        <NoteBlock title="Compliance warnings" tone="warn" items={data.compliance_warnings} />
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
          items={data.unmapped_jurisdictions.map((j) => `${flagEmoji(j)} ${j}`)}
        />
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
              <p className="font-mono text-[11px] uppercase tracking-widest text-teal">Preview tier</p>
              <h3 className="mt-1 font-serif text-xl text-navy">
                {data.teaser_headline ?? "Unlock the full report and legal appendix"}
              </h3>
              <p className="mt-1 text-sm text-navy/70">
                Consumer reports from €99. Advisor licences from €199/mo. Verified rates, top-K alternate paths, and export-ready deliverables.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/pricing"
                className="rounded-sm bg-navy px-4 py-2.5 font-mono text-[11px] uppercase tracking-widest text-white hover:bg-teal"
              >
                View plans
              </Link>
              <Link
                to="/account"
                className="rounded-sm border border-navy/20 bg-white px-4 py-2.5 font-mono text-[11px] uppercase tracking-widest text-navy hover:border-teal hover:text-teal"
              >
                Manage account
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        {data.oecd_cbcr_xml && (
          <DownloadButton label="OECD CbCR XML" filename={`cbcr_${data.runId}.xml`} content={data.oecd_cbcr_xml} />
        )}
        {data.globe_gir_xml && (
          <DownloadButton label="GloBE GIR XML" filename={`gir_${data.runId}.xml`} content={data.globe_gir_xml} />
        )}
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

function DownloadButton({ label, filename, content }: { label: string; filename: string; content: string }) {
  const onClick = () => {
    const blob = new Blob([content], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <button
      onClick={onClick}
      className="rounded-sm border border-teal/50 bg-white px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-teal hover:bg-teal hover:text-white"
    >
      ↓ {label}
    </button>
  );
}

function NoteBlock({ title, tone, items }: { title: string; tone: "warn" | "info"; items: string[] }) {
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
