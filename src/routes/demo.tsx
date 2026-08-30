import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Copy, Loader2, QrCode } from "lucide-react";
import { DEMO_CORRIDOR, redeemQrToken } from "@/lib/demo";
import { getScenario, runSimulation, type WorkspaceRun } from "@/lib/workspace/scenarios";
import { flagFor } from "@/lib/workspace/jurisdictions";
import { useSession } from "@/lib/auth/session";

type Search = { token?: string };

const TITLE = "Live demo — one run, one route · TaxSailor";
const DESC =
  "Run one cross-border corridor and see the retained share, the route the graph picked and the legal basis behind each hop.";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): Search => ({
    token:
      typeof search.token === "string"
        ? search.token
        : typeof search.t === "string"
          ? search.t
          : undefined,
  }),
  component: DemoPage,
});

function DemoPage() {
  const { token: qrToken } = Route.useSearch();
  const { session } = useSession();
  const navigate = useNavigate();

  const [tokenInput, setTokenInput] = useState(qrToken ?? "");
  const [redeeming, setRedeeming] = useState(false);
  const [redeemed, setRedeemed] = useState<string | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);

  const [run, setRun] = useState<WorkspaceRun | null>(null);
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const scenario = getScenario(DEMO_CORRIDOR.scenarioId);

  async function redeem(value: string) {
    if (!value.trim() || redeeming) return;
    setRedeeming(true);
    setRedeemError(null);
    try {
      const res = await redeemQrToken(value);
      setRedeemed(res.message || `Access granted for ${res.event}.`);
    } catch (e) {
      setRedeemError(e instanceof Error ? e.message : "That code could not be redeemed.");
    } finally {
      setRedeeming(false);
    }
  }

  // Auto-redeem when a printed QR code carried the token in the URL.
  useEffect(() => {
    if (qrToken) void redeem(qrToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrToken]);

  async function runCorridor() {
    if (!scenario || running) return;
    setRunning(true);
    setRunError(null);
    try {
      const result = await runSimulation(scenario, {
        origin: DEMO_CORRIDOR.origin,
        destination: DEMO_CORRIDOR.destination,
        amount: DEMO_CORRIDOR.amount,
      });
      setRun(result);
    } catch (e) {
      setRunError(e instanceof Error ? e.message : "The run could not be completed.");
    } finally {
      setRunning(false);
    }
  }

  const demoUrl =
    typeof window === "undefined" ? "https://www.taxsailor.com/demo" : `${window.location.origin}/demo`;

  return (
    <div className="bg-white">
      <section className="border-b border-navy/10 bg-ghost">
        <div className="mx-auto max-w-6xl px-6 py-14 md:py-20">
          <p className="font-mono text-[11px] uppercase tracking-widest text-teal">Live demo</p>
          <h1 className="mt-3 max-w-3xl font-serif text-3xl leading-tight text-navy md:text-5xl">
            One run. One route. The full legal basis.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-navy/70 md:text-base">
            {DESC} No forms, no discovery call. The corridor below is a EUR{" "}
            {DEMO_CORRIDOR.amount.toLocaleString("en-GB")} dividend leaving Germany for the United
            Arab Emirates.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-12 lg:grid-cols-[1.35fr_1fr] lg:py-16">
        {/* Proof panel */}
        <div className="rounded-sm border border-navy/12 bg-white p-6 shadow-[0_1px_2px_rgba(5,35,71,0.04)] md:p-8">
          <h2 className="font-serif text-2xl text-navy">Demo corridor</h2>
          <dl className="mt-5 grid gap-4 sm:grid-cols-3">
            <Field label="From" value={`${flagFor(DEMO_CORRIDOR.origin)} ${DEMO_CORRIDOR.origin}`} />
            <Field
              label="To"
              value={`${flagFor(DEMO_CORRIDOR.destination)} ${DEMO_CORRIDOR.destination}`}
            />
            <Field label="Amount" value={`EUR ${DEMO_CORRIDOR.amount.toLocaleString("en-GB")}`} />
          </dl>

          <button
            type="button"
            onClick={runCorridor}
            disabled={running}
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-sm bg-navy px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal disabled:opacity-50"
          >
            {running ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
            {run ? "Run again" : "Run the corridor"}
          </button>

          {runError && (
            <p className="mt-4 rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {runError}
              {!session && (
                <>
                  {" "}
                  <Link to="/login" className="underline">
                    Sign in
                  </Link>{" "}
                  or redeem an event code to run the demo.
                </>
              )}
            </p>
          )}

          {run && (
            <div className="mt-7 grid gap-5 border-t border-navy/10 pt-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <Metric
                  label="Retained"
                  value={
                    run.retained_earnings_pct !== null && run.retained_earnings_pct !== undefined
                      ? `${run.retained_earnings_pct.toFixed(1)}%`
                      : (run.retained_pct_masked ?? run.retained_pct_band ?? "Locked")
                  }
                />
                <Metric
                  label="Tax leakage"
                  value={
                    run.tax_leakage_pct !== null && run.tax_leakage_pct !== undefined
                      ? `${run.tax_leakage_pct.toFixed(1)}%`
                      : (run.tax_leakage_pct_masked ?? "Locked")
                  }
                />
                <Metric label="Hops" value={String(run.hop_count ?? run.optimal_path.length - 1)} />
              </div>

              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-navy/50">Route</p>
                <ol className="mt-2 flex flex-wrap items-center gap-2">
                  {run.optimal_path.map((node, i) => (
                    <li key={`${node}-${i}`} className="flex items-center gap-2">
                      <span className="rounded-sm border border-navy/15 bg-ghost px-2.5 py-1.5 text-sm text-navy">
                        {flagFor(node)} {node}
                      </span>
                      {i < run.optimal_path.length - 1 && (
                        <ArrowRight className="size-3.5 text-teal" aria-hidden />
                      )}
                    </li>
                  ))}
                </ol>
              </div>

              {run.compliance_warnings.length > 0 && (
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-navy/50">
                    Compliance notes
                  </p>
                  <ul className="mt-2 grid gap-1 text-sm text-navy/70">
                    {run.compliance_warnings.slice(0, 4).map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate({ to: "/workspace/results/$runId", params: { runId: run.runId } })}
                  className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-navy/15 px-4 py-2.5 text-sm text-navy transition-colors hover:border-navy/40"
                >
                  Open the full briefing
                </button>
                <Link
                  to="/workspace"
                  className="inline-flex min-h-11 items-center gap-2 rounded-sm bg-teal px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy"
                >
                  Try your own corridor
                </Link>
              </div>

              <p className="text-xs leading-relaxed text-navy/50">
                {run.compliance_pending_notice ||
                  "Results are model output for discussion, not tax advice."}
              </p>
            </div>
          )}
        </div>

        {/* QR / access panel */}
        <div className="grid content-start gap-6">
          <div className="rounded-sm border border-navy/12 bg-white p-6">
            <div className="flex items-center gap-2 text-navy">
              <QrCode className="size-4 text-teal" />
              <h2 className="font-serif text-xl">Event code</h2>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-navy/70">
              Scanned a printed code at an event? Enter it here to unlock a demo session with full
              numbers for the corridor.
            </p>
            <form
              className="mt-4 grid gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                void redeem(tokenInput);
              }}
            >
              <label className="grid gap-1.5">
                <span className="font-mono text-[10px] uppercase tracking-widest text-navy/50">
                  Code
                </span>
                <input
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="e.g. PITSTOP-2026"
                  className="min-h-11 rounded-sm border border-navy/15 px-3 py-2 text-sm text-navy outline-none focus:border-teal"
                />
              </label>
              <button
                type="submit"
                disabled={redeeming || !tokenInput.trim()}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm bg-navy px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal disabled:opacity-50"
              >
                {redeeming && <Loader2 className="size-4 animate-spin" />} Redeem code
              </button>
            </form>
            {redeemed && (
              <p className="mt-3 rounded-sm border border-teal/30 bg-teal/5 px-3 py-2 text-sm text-navy">
                {redeemed}
              </p>
            )}
            {redeemError && (
              <p className="mt-3 rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {redeemError}
              </p>
            )}
          </div>

          <div className="rounded-sm border border-navy/12 bg-ghost p-6">
            <h2 className="font-serif text-xl text-navy">Share this demo</h2>
            <p className="mt-2 text-sm leading-relaxed text-navy/70">
              Printed codes and QR stickers point at this page. Append your event code as{" "}
              <code className="rounded bg-navy/5 px-1 py-0.5 font-mono text-xs">?token=CODE</code> and
              the session unlocks on scan.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <code className="flex-1 truncate rounded-sm border border-navy/15 bg-white px-3 py-2 font-mono text-xs text-navy">
                {demoUrl}
              </code>
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard.writeText(demoUrl);
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1800);
                }}
                aria-label="Copy demo link"
                className="grid size-11 place-items-center rounded-sm border border-navy/15 text-navy transition-colors hover:border-navy/40"
              >
                {copied ? <Check className="size-4 text-teal" /> : <Copy className="size-4" />}
              </button>
            </div>
          </div>

          <div className="rounded-sm border border-navy/12 bg-white p-6">
            <h2 className="font-serif text-xl text-navy">What happens next</h2>
            <ol className="mt-3 grid gap-3 text-sm leading-relaxed text-navy/70">
              <li>1. Run the corridor and read the route the graph selected.</li>
              <li>2. Open the briefing for the proof table and the legal references per hop.</li>
              <li>
                3. Bring your own corridor in the{" "}
                <Link to="/workspace" className="text-teal hover:underline">
                  workspace
                </Link>{" "}
                or{" "}
                <Link to="/contact" className="text-teal hover:underline">
                  book a pilot
                </Link>
                .
              </li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-widest text-navy/50">{label}</dt>
      <dd className="mt-1 text-sm text-navy">{value}</dd>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-navy/12 bg-ghost px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-widest text-navy/50">{label}</p>
      <p className="mt-1 font-serif text-2xl text-navy">{value}</p>
    </div>
  );
}
