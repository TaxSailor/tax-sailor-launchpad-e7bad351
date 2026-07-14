import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, LineChart, Building2, User, Rocket, ShieldCheck, GitBranch } from "lucide-react";
import { RouteGraph } from "@/components/site/RouteGraph";
import { StatBar } from "@/components/site/StatBar";
import { LeadDialog } from "@/components/site/LeadForm";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TaxSailor — Computational Tax Intelligence for Cross-Border Capital" },
      {
        name: "description",
        content:
          "Log-transformed Dijkstra route optimization across 131 jurisdictions and 438 treaty edges. Proof-carrying advisory for cross-border capital.",
      },
      { property: "og:title", content: "TaxSailor — Computational Tax Intelligence" },
      {
        property: "og:description",
        content: "Navigate borders. Keep more. Prove everything.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "TaxSailor",
          url: "/",
          description: "Computational tax intelligence for cross-border capital.",
        }),
      },
    ],
  }),
  component: Home,
});

const audiences = [
  {
    to: "/investors" as const,
    accent: "text-teal",
    dot: "bg-teal",
    icon: Rocket,
    kicker: "01 · INVESTORS",
    title: "Fund the graph",
    body: "Seed round underway. Data room, thesis, and traction on request.",
  },
  {
    to: "/pilot" as const,
    accent: "text-emerald",
    dot: "bg-emerald",
    icon: GitBranch,
    kicker: "02 · PILOT",
    title: "5–10 DACH firms",
    body: "30-day free pilot for boutique advisory. Q3 2026 cohort.",
  },
  {
    to: "/corporations" as const,
    accent: "text-steel",
    dot: "bg-steel",
    icon: Building2,
    kicker: "03 · CORPORATIONS",
    title: "WHT · Pillar Two",
    body: "Group-level withholding and treaty routing at scale.",
  },
  {
    to: "/individuals" as const,
    accent: "text-amber-brand",
    dot: "bg-amber-brand",
    icon: User,
    kicker: "04 · INDIVIDUALS",
    title: "Residency · §6/§2 AStG",
    body: "Cross-border relocation and estate scenarios with math you can audit.",
  },
];

const pillars = [
  {
    kicker: "COMPUTATION",
    title: "Log-transformed Dijkstra",
    body: "We convert 438 treaty edges into a weighted graph with W = −ln(1 − τ). Optimal cross-border paths are provably shortest — not heuristically good.",
    formula: "W = −ln(1 − τ)",
  },
  {
    kicker: "COVERAGE",
    title: "131 jurisdictions · 3,000+ documents",
    body: "Every treaty, OECD update, and domestic protocol we ingest is versioned, cited, and machine-verifiable.",
    formula: "|V| = 131  |E| = 438",
  },
  {
    kicker: "PROOF",
    title: "Advisor-grade citations",
    body: "Every recommendation ships with the article, paragraph, and effective date. Your work stays defensible.",
    formula: "∀ output ∃ citation",
  },
];

function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-navy/10 bg-white px-6 pb-20 pt-16 md:pt-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div className="animate-fade-up">
            <p className="mb-6 font-mono text-xs uppercase tracking-widest text-teal">
              v0.1 · Computational Tax Intelligence
            </p>
            <h1 className="font-serif text-5xl leading-[1.05] tracking-tight text-navy md:text-6xl lg:text-7xl">
              Navigate borders.
              <br />
              <span className="text-teal">Keep more.</span>
              <br />
              Prove everything.
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-navy/70">
              TaxSailor is the world's first computational tax intelligence platform.
              We route cross-border capital across 131 jurisdictions using log-transformed
              Dijkstra optimization — the same math that steers submarines, only for treaty networks.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <LeadDialog
                audience="pilot"
                trigger={
                  <button className="inline-flex items-center gap-2 rounded-sm bg-navy px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-teal">
                    Request pilot access <ArrowRight className="size-4" />
                  </button>
                }
              />
              <LeadDialog
                audience="investors"
                trigger={
                  <button className="inline-flex items-center gap-2 rounded-sm border border-navy/15 bg-white px-6 py-3.5 text-sm font-medium text-navy transition-colors hover:bg-ghost">
                    Book an investor call
                  </button>
                }
              />
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 font-mono text-[11px] uppercase tracking-widest text-navy/50">
              <span>· Pilot Q3 2026</span>
              <span>· Founded Munich</span>
              <span>· 4 founders</span>
            </div>
          </div>

          <div className="animate-fade-up rounded-md border border-navy/10 bg-ghost p-2 shadow-[0_20px_60px_-30px_rgba(5,35,71,0.35)]">
            <div className="flex items-center justify-between border-b border-navy/10 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-navy/50">
              <span>Route.optimize()</span>
              <span className="text-teal">● live</span>
            </div>
            <RouteGraph className="h-auto w-full" />
          </div>
        </div>
      </section>

      <StatBar />

      {/* PILLARS */}
      <section className="border-b border-navy/10 bg-white px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 max-w-2xl">
            <p className="mb-4 font-mono text-xs uppercase tracking-widest text-teal">
              The Ledger · Three Pillars
            </p>
            <h2 className="font-serif text-4xl text-navy md:text-5xl">
              Tax planning, rewritten as a solved graph problem.
            </h2>
          </div>
          <div className="grid gap-px overflow-hidden rounded-md border border-navy/10 bg-navy/10 md:grid-cols-3">
            {pillars.map((p, i) => (
              <article key={p.title} className="bg-white p-8">
                <p className="mb-6 font-mono text-[11px] uppercase tracking-widest text-navy/40">
                  0{i + 1} · {p.kicker}
                </p>
                <h3 className="font-serif text-2xl leading-tight text-navy">{p.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-navy/70">{p.body}</p>
                <div className="mt-8 inline-flex rounded-sm bg-ghost px-3 py-1.5 font-mono text-xs text-teal">
                  {p.formula}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* AUDIENCE ROUTER */}
      <section className="bg-ghost px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <p className="mb-4 font-mono text-xs uppercase tracking-widest text-teal">
                Select your route
              </p>
              <h2 className="font-serif text-4xl text-navy md:text-5xl">
                Four audiences. One graph.
              </h2>
            </div>
            <p className="max-w-sm text-sm text-navy/60">
              The math is the same. The way you use it is not. Pick the entry point that matches your work.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {audiences.map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="group flex flex-col rounded-md border border-navy/10 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-navy/25 hover:shadow-[0_20px_40px_-25px_rgba(5,35,71,0.3)]"
              >
                <div className="flex items-center justify-between">
                  <div className={`grid size-10 place-items-center rounded-sm bg-ghost ${a.accent}`}>
                    <a.icon className="size-5" />
                  </div>
                  <span className={`size-2 rounded-full ${a.dot}`} />
                </div>
                <p className="mt-8 font-mono text-[10px] uppercase tracking-widest text-navy/40">
                  {a.kicker}
                </p>
                <h3 className="mt-2 font-serif text-xl text-navy">{a.title}</h3>
                <p className="mt-2 flex-1 text-sm text-navy/60">{a.body}</p>
                <div className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-navy transition-colors group-hover:text-teal">
                  Enter <ArrowRight className="size-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PROOF STRIP */}
      <section className="border-y border-navy/10 bg-navy px-6 py-24 text-white">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-widest text-teal">
              Why it holds up in an audit
            </p>
            <h2 className="font-serif text-4xl md:text-5xl">
              Every answer, cited. Every route, provable.
            </h2>
            <p className="mt-6 max-w-lg text-white/70">
              LLM-only tax tools hallucinate. Ours doesn't. Recommendations are computed
              on a versioned treaty graph and ship with paragraph-level citations to
              primary sources.
            </p>
          </div>
          <div className="grid gap-4">
            {[
              { icon: ShieldCheck, title: "Primary-source citations", body: "Article, paragraph, effective date — on every output line." },
              { icon: GitBranch, title: "Versioned graph", body: "Every OECD update, every protocol, every domestic change is timestamped." },
              { icon: LineChart, title: "Deterministic pathing", body: "Shortest-path proof, not stochastic best guess." },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 rounded-sm border border-white/10 bg-white/5 p-5">
                <item.icon className="size-5 shrink-0 text-teal" />
                <div>
                  <p className="font-serif text-lg">{item.title}</p>
                  <p className="mt-1 text-sm text-white/60">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-white px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-teal">
            Setting sail Q3 2026
          </p>
          <h2 className="font-serif text-5xl text-navy md:text-6xl">
            Ready to plot a route?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-navy/70">
            Whether you're an investor, an advisory firm, or a cross-border operator —
            start with a conversation.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <LeadDialog
              audience="general"
              trigger={
                <button className="inline-flex items-center gap-2 rounded-sm bg-navy px-7 py-4 text-sm font-medium text-white transition-colors hover:bg-teal">
                  Contact TaxSailor <ArrowRight className="size-4" />
                </button>
              }
            />
            <Link
              to="/about"
              className="inline-flex items-center gap-2 rounded-sm border border-navy/15 bg-white px-7 py-4 text-sm font-medium text-navy transition-colors hover:bg-ghost"
            >
              Meet the crew
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
