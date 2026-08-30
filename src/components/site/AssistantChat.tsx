// Floating assistant chat — mounted inside the authenticated workspace layout.
// Posts the trailing history to the backend at /ui/chat on every turn, together
// with the UI context of the most recent run so the assistant can answer about
// what the user is looking at. Renders workspace deep-link actions, the gating
// teaser, and a short cooldown after a failed turn.

import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "@tanstack/react-router";
import { MessageCircle, X, Send, Loader2, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { listRecentRuns, type WorkspaceRun } from "@/lib/workspace/scenarios";
import { codeForName } from "@/lib/workspace/jurisdictions";

type Msg = { role: "user" | "assistant"; content: string };

type WorkspaceAction = {
  id: string;
  label: string;
  scenario_id: string;
  origin_code?: string;
  target_code?: string;
  asset_value?: number | null;
  flow_step?: string | null;
  panel?: string | null;
};

type ChatReply = {
  reply?: string;
  gated?: boolean;
  entitlement_tier?: string | null;
  teaser_headline?: string | null;
  workspace_actions?: WorkspaceAction[];
  results_handoff?: boolean;
};

type Turn = Msg & {
  gated?: boolean;
  teaser?: string | null;
  actions?: WorkspaceAction[];
};

const SEED: Turn[] = [
  {
    role: "assistant",
    content:
      "I can explain your run, compare corridors, and set up a scenario for you. I am not a licensed advisor, so for anything binding book a call from the contact page.",
  },
];

const STARTERS = [
  "Explain my last run in plain terms",
  "Which corridor keeps the most after tax?",
  "What compliance risks apply to this route?",
  "Set up a German dividend into the UAE",
];

const COOLDOWN_MS = 8000;

function uiContextFrom(run: WorkspaceRun | null) {
  if (!run) return undefined;
  return {
    scenario_id: run.scenarioId,
    scenario_label: run.scenarioLabel,
    simulation_mode: run.request.mode,
    perspective: run.request.user_profile.perspective,
    source_country: run.input.origin,
    target_country: run.input.destination,
    origin_country: run.input.origin,
    source_code: codeForName(run.input.origin),
    target_code: codeForName(run.input.destination),
    asset_value: run.amount,
    search_mode: "corridor",
  };
}

export function AssistantChat() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Turn[]>(SEED);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(Date.now());
  const scrollRef = useRef<HTMLDivElement>(null);

  const latestRun = useMemo(() => (open ? (listRecentRuns()[0] ?? null) : null), [open, messages.length]);
  const cooling = cooldownUntil > now;
  const coolingSeconds = Math.max(0, Math.ceil((cooldownUntil - now) / 1000));

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  useEffect(() => {
    if (!cooling) return;
    const t = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(t);
  }, [cooling]);

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || sending || cooling) return;
    setError(null);
    const next: Turn[] = [...messages, { role: "user", content: clean }];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      const history = next
        .filter((m) => m.content.trim().length > 0)
        .slice(-20)
        .map((m) => ({ role: m.role, content: m.content }));
      const res = await api.post<ChatReply>("/ui/chat", {
        messages: history,
        ui_context: uiContextFrom(latestRun) ?? null,
        active_result: latestRun
          ? {
              optimal_path: latestRun.optimal_path,
              retained_earnings_pct: latestRun.retained_earnings_pct,
              tax_leakage_pct: latestRun.tax_leakage_pct,
              compliance_warnings: latestRun.compliance_warnings,
            }
          : null,
      } as never);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: res.reply ?? "",
          gated: res.gated ?? false,
          teaser: res.teaser_headline ?? null,
          actions: res.workspace_actions ?? [],
        },
      ]);
      if (res.results_handoff && latestRun) {
        navigate({ to: "/workspace/results/$runId", params: { runId: latestRun.runId } });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "The assistant is not reachable right now.");
      setCooldownUntil(Date.now() + COOLDOWN_MS);
      setNow(Date.now());
    } finally {
      setSending(false);
    }
  }

  function openAction(a: WorkspaceAction) {
    const search: Record<string, string | number> = {};
    if (a.origin_code) search.from = a.origin_code;
    if (a.target_code) search.to = a.target_code;
    if (a.asset_value) search.amount = a.asset_value;
    navigate({
      to: "/workspace/scenario/$scenarioId",
      params: { scenarioId: a.scenario_id },
      search,
    });
    setOpen(false);
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex min-h-11 items-center gap-2 rounded-full bg-navy px-5 py-3 text-sm font-medium text-white shadow-xl transition-colors hover:bg-teal"
          aria-label="Open assistant"
        >
          <MessageCircle className="size-4" /> Ask TaxSailor
        </button>
      )}
      {open && (
        <div className="fixed bottom-6 right-6 z-40 flex h-[min(560px,calc(100vh-3rem))] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-md border border-navy/15 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-navy/10 bg-navy px-4 py-3 text-white">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-teal">Assistant</p>
              <p className="font-serif text-sm">TaxSailor helper</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-sm p-2 hover:bg-white/10"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>

          {latestRun && (
            <p className="border-b border-navy/10 bg-ghost px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-navy/60">
              Context: {latestRun.scenarioLabel} · {latestRun.input.origin} to{" "}
              {latestRun.input.destination}
            </p>
          )}

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-ghost/40 px-4 py-4">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[85%] rounded-md bg-navy px-3 py-2 text-sm text-white"
                      : "max-w-[95%] text-sm text-navy [&_a]:text-teal [&_a]:underline [&_code]:rounded [&_code]:bg-navy/5 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:text-navy [&_strong]:font-semibold"
                  }
                >
                  {m.role === "assistant" ? <ReactMarkdown>{m.content}</ReactMarkdown> : m.content}
                  {m.role === "assistant" && m.gated && (
                    <div className="mt-3 rounded-sm border border-teal/30 bg-teal/5 px-3 py-2 text-xs text-navy">
                      {m.teaser ?? "The full answer is part of a paid plan."}{" "}
                      <a href="/pricing" className="text-teal underline">
                        See plans
                      </a>
                    </div>
                  )}
                  {m.role === "assistant" && m.actions && m.actions.length > 0 && (
                    <div className="mt-3 grid gap-2">
                      {m.actions.map((a) => (
                        <button
                          key={`${a.id}-${a.label}`}
                          type="button"
                          onClick={() => openAction(a)}
                          className="inline-flex min-h-11 items-center justify-between gap-2 rounded-sm border border-navy/15 bg-white px-3 py-2 text-left text-xs text-navy transition-colors hover:border-teal"
                        >
                          {a.label}
                          <ArrowRight className="size-3.5 shrink-0 text-teal" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {messages.length === 1 && (
              <div className="grid gap-2 pt-2">
                <p className="font-mono text-[10px] uppercase tracking-widest text-navy/50">
                  Try one of these
                </p>
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void send(s)}
                    className="rounded-sm border border-navy/15 bg-white px-3 py-2 text-left text-xs text-navy transition-colors hover:border-teal"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {sending && (
              <div className="flex items-center gap-2 text-xs text-navy/60">
                <Loader2 className="size-3 animate-spin" /> Working on it
              </div>
            )}
            {error && (
              <p className="rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
                {cooling && ` Retry in ${coolingSeconds}s.`}
              </p>
            )}
          </div>

          <div className="border-t border-navy/10 bg-white p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send(input);
                  }
                }}
                placeholder={cooling ? `Retry in ${coolingSeconds}s` : "Ask about your workspace"}
                rows={1}
                className="max-h-32 min-h-11 flex-1 resize-none rounded-sm border border-navy/15 bg-white px-3 py-2 text-sm text-navy outline-none focus:border-teal"
              />
              <button
                onClick={() => void send(input)}
                disabled={sending || cooling || !input.trim()}
                className="grid size-11 place-items-center rounded-sm bg-navy text-white transition-colors hover:bg-teal disabled:opacity-40"
                aria-label="Send"
              >
                <Send className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
