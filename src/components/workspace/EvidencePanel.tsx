// Evidence for a computed route: per-hop legal references plus the treaty and
// compliance documents behind them. Loaded on request to keep results fast.

import { useState } from "react";
import { Loader2, FileText, Scale } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  fetchRouteCitations,
  fetchRouteSources,
  type DocumentSourceResponse,
  type EdgeCitationResponse,
} from "@/lib/workspace/evidence";
import type { PathEdgeDetail } from "@/lib/workspace/scenarios";
import { flagFor } from "@/lib/workspace/jurisdictions";

type Loaded = {
  citations: EdgeCitationResponse[];
  citationCount: number;
  sources: DocumentSourceResponse[];
  complianceSources: DocumentSourceResponse[];
  noticeSources: DocumentSourceResponse[];
  gated: boolean;
  tier: string | null;
};

export function EvidencePanel({
  path,
  pathDetails,
  complianceWarnings,
}: {
  path: string[];
  pathDetails?: PathEdgeDetail[] | null;
  complianceWarnings?: string[] | null;
}) {
  const [data, setData] = useState<Loaded | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [citations, sources] = await Promise.all([
        fetchRouteCitations(path, pathDetails, complianceWarnings),
        fetchRouteSources(path, pathDetails),
      ]);
      setData({
        citations: citations.citations ?? [],
        citationCount: citations.citation_count ?? (citations.citations?.length ?? 0),
        sources: sources.sources ?? [],
        complianceSources: sources.compliance_sources ?? [],
        noticeSources: sources.notice_sources ?? [],
        gated: Boolean(citations.gated || sources.gated),
        tier: citations.entitlement_tier ?? sources.entitlement_tier ?? null,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load the legal evidence for this route.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-8 rounded-sm border border-navy/10 bg-white p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-teal">Evidence</p>
          <h2 className="mt-1 font-serif text-xl text-navy">Legal basis per hop</h2>
          <p className="mt-1 text-sm text-navy/65">
            Every rate on this route traces back to a treaty article or a national statute. Load the
            references and the source documents behind them.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-sm border border-teal/50 bg-white px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-teal hover:bg-teal hover:text-white disabled:opacity-50"
        >
          {loading && <Loader2 className="size-3 animate-spin" />}
          {data ? "Refresh" : "Load evidence"}
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-sm border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          {error}
        </p>
      )}

      {data && (
        <div className="mt-6 space-y-6">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-widest text-navy/55">
            <span>{data.citationCount} references</span>
            <span>{data.sources.length} treaty documents</span>
            <span>{data.complianceSources.length} compliance documents</span>
            {data.tier && <span>Tier: {data.tier}</span>}
          </div>

          {data.citations.length === 0 && (
            <p className="text-sm text-navy/60">
              No stored reference matches this route yet. The rates come from the statutory baseline.
            </p>
          )}

          {data.citations.length > 0 && (
            <ol className="space-y-3">
              {data.citations.map((c, i) => (
                <li
                  key={`${c.hop_index}-${i}`}
                  className="rounded-sm border border-navy/10 bg-ghost p-4"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-medium text-navy">
                      {flagFor(c.from_jurisdiction)} {c.from_jurisdiction}
                      <span className="mx-2 text-navy/35">to</span>
                      {flagFor(c.to_jurisdiction)} {c.to_jurisdiction}
                    </p>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-teal">
                      {c.citation_type}
                    </span>
                  </div>
                  <p className="mt-2 font-mono text-xs text-navy/70">{c.legal_reference}</p>
                  {c.summary && <p className="mt-2 text-sm text-navy/75">{c.summary}</p>}
                  <div className="mt-2 flex flex-wrap gap-4 font-mono text-[11px] text-navy/55">
                    <span>
                      Withholding:{" "}
                      {c.wht_rate_pct != null
                        ? `${c.wht_rate_pct.toFixed(1)} percent`
                        : (c.wht_rate_masked ?? "not disclosed")}
                    </span>
                    {c.penalty_rate_pct != null && (
                      <span>Penalty loading: {c.penalty_rate_pct.toFixed(1)} percent</span>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}

          <SourceList
            title="Treaty and rate sources"
            icon="scale"
            items={data.sources}
          />
          <SourceList
            title="Compliance sources"
            icon="file"
            items={data.complianceSources}
          />
          <SourceList title="Notices" icon="file" items={data.noticeSources} />

          {data.gated && (
            <div className="rounded-sm border-2 border-teal/40 bg-teal/5 p-4">
              <p className="text-sm text-navy/80">
                Exact rates and the full document set are part of the paid tiers. Your current plan
                shows the reference list with masked figures.
              </p>
              <Link
                to="/pricing"
                className="mt-3 inline-flex min-h-11 items-center rounded-sm bg-navy px-4 py-2.5 font-mono text-[11px] uppercase tracking-widest text-white hover:bg-teal"
              >
                View plans
              </Link>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function SourceList({
  title,
  items,
  icon,
}: {
  title: string;
  items: DocumentSourceResponse[];
  icon: "scale" | "file";
}) {
  if (!items || items.length === 0) return null;
  const Icon = icon === "scale" ? Scale : FileText;
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-widest text-navy/55">{title}</p>
      <ul className="mt-3 space-y-2">
        {items.map((s, i) => (
          <li
            key={`${s.filename}-${i}`}
            className="flex items-start gap-3 border-b border-navy/10 pb-2 text-sm text-navy/80 last:border-0"
          >
            <Icon className="mt-0.5 size-4 shrink-0 text-teal" />
            <span>
              <span className="font-medium text-navy">{s.title || s.filename}</span>
              <span className="ml-2 font-mono text-[11px] uppercase tracking-widest text-navy/45">
                {s.document_type}
                {s.party_a_code && s.party_b_code
                  ? ` · ${s.party_a_code}-${s.party_b_code}`
                  : ""}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
