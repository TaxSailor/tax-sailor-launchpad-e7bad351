import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, TrendingUp, Users, MapPin, Clock } from "lucide-react";
import { LeadDialog } from "@/components/site/LeadForm";

export const Route = createFileRoute("/investors")({
  head: () => ({
    meta: [
      { title: "Investors — TaxSailor" },
      {
        name: "description",
        content:
          "TaxSailor is raising a seed round. Computational tax intelligence, EUR 12B TAM, Q3 2026 pilot with DACH boutique advisory firms.",
      },
      { property: "og:title", content: "Investors — TaxSailor" },
      {
        property: "og:description",
        content: "The market for cross-border tax intelligence is EUR 12B. We're building the graph.",
      },
      { property: "og:url", content: "/investors" },
    ],
    links: [{ rel: "canonical", href: "/investors" }],
  }),
  component: InvestorsPage,
});

const stats = [
  { icon: TrendingUp, value: "€12B", label: "TAM · Global tax advisory" },
  { icon: MapPin, value: "131", label: "Jurisdictions modeled" },
  { icon: Users, value: "5–10", label: "Pilot firms · Q3 2026" },
  { icon: Clock, value: "24 mo", label: "To European roll-out" },
];

const milestones = [
  { period: "Q3 2026", title: "DACH Pilot", body: "5–10 boutique advisory firms. 30-day free trial. Product-market fit validation." },
  { period: "Q1 2027", title: "Paid Conversion", body: "Convert pilots to paid seats at €149 / €249 / €499 tiers. Start expansion." },
  { period: "Q3 2027", title: "European Expansion", body: "Extend to FR, IT, NL, ES. Corporate WHT and Pillar Two modules ship." },
  { period: "2028", title: "Banking Layer", body: "Custody + treasury integration for HNW cross-border capital. Series A." },
];

function InvestorsPage() {
  return (
    <>
      <section className="border-b border-navy/10 bg-white px-6 pb-16 pt-16 md:pt-24">
        <div className="mx-auto max-w-7xl">
          <p className="mb-6 font-mono text-xs uppercase tracking-widest text-teal">
            01 · For Investors & Connectors
          </p>
          <h1 className="max-w-4xl font-serif text-5xl leading-[1.05] text-navy md:text-6xl lg:text-7xl">
            The <span className="text-teal">tax layer</span> for cross-border capital.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-navy/70">
            Cross-border wealth is growing faster than the advisory industry can keep up.
            LLM tools hallucinate. Big Four rates start at €800/hour. TaxSailor sits between
            them — deterministic, cited, and 10× faster.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <LeadDialog
              audience="investors"
              trigger={
                <button className="inline-flex items-center gap-2 rounded-sm bg-navy px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-teal">
                  Request the deck <ArrowRight className="size-4" />
                </button>
              }
            />
          </div>
        </div>
      </section>

      <section className="border-b border-navy/10 bg-ghost px-6 py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-md border border-navy/10 bg-white p-6">
              <s.icon className="size-5 text-teal" />
              <p className="mt-4 font-mono text-3xl text-navy">{s.value}</p>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-widest text-navy/50">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-b border-navy/10 bg-white px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-teal">The thesis</p>
          <h2 className="max-w-3xl font-serif text-4xl text-navy md:text-5xl">
            Three markets are colliding — and no one has the graph.
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                n: "01",
                title: "Cross-border wealth is exploding",
                body: "Cross-border personal wealth grew 5.2% CAGR (2020–24). Sanctions, remote work, and Pillar Two accelerated migration between jurisdictions.",
              },
              {
                n: "02",
                title: "Advisory is capacity-constrained",
                body: "Boutique firms turn away 30–40% of cross-border cases. Big Four is priced out of the mid-market. AI tools hallucinate on treaty edges.",
              },
              {
                n: "03",
                title: "The graph exists — nobody's built it",
                body: "131 jurisdictions × 438 bilateral treaties × 3,000+ interpretive documents is a graph problem. We compiled it.",
              },
            ].map((t) => (
              <div key={t.n} className="rounded-md border border-navy/10 p-8">
                <p className="font-mono text-xs text-teal">{t.n}</p>
                <h3 className="mt-3 font-serif text-2xl leading-tight text-navy">{t.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-navy/70">{t.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy px-6 py-24 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-teal">Roadmap</p>
          <h2 className="max-w-3xl font-serif text-4xl md:text-5xl">
            From pilot to banking layer in 24 months.
          </h2>
          <div className="mt-14 grid gap-4">
            {milestones.map((m, i) => (
              <div
                key={m.period}
                className="grid grid-cols-[80px_1fr] items-start gap-6 border-t border-white/10 py-6 md:grid-cols-[160px_1fr_auto]"
              >
                <p className="font-mono text-xs uppercase tracking-widest text-teal">{m.period}</p>
                <div>
                  <h3 className="font-serif text-2xl">{m.title}</h3>
                  <p className="mt-2 max-w-2xl text-sm text-white/60">{m.body}</p>
                </div>
                <p className="hidden font-mono text-xs text-white/30 md:block">0{i + 1}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-teal">Next step</p>
          <h2 className="font-serif text-4xl text-navy md:text-5xl">
            We'll walk you through the graph.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-navy/70">
            30-minute call, data room access, and a live demo of route optimization
            across a real DACH-to-Singapore case.
          </p>
          <div className="mt-10 flex justify-center">
            <LeadDialog
              audience="investors"
              trigger={
                <button className="inline-flex items-center gap-2 rounded-sm bg-navy px-7 py-4 text-sm font-medium text-white transition-colors hover:bg-teal">
                  Book an investor call <ArrowRight className="size-4" />
                </button>
              }
            />
          </div>
        </div>
      </section>
    </>
  );
}
