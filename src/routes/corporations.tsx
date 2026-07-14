import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Layers, Globe2, ShieldCheck, Scale } from "lucide-react";
import { LeadDialog } from "@/components/site/LeadForm";

export const Route = createFileRoute("/corporations")({
  head: () => ({
    meta: [
      { title: "Corporations — TaxSailor" },
      {
        name: "description",
        content:
          "Withholding tax optimization, Pillar Two modeling, and treaty routing for multinational groups. Deterministic, cited, audit-ready.",
      },
      { property: "og:title", content: "Corporations — TaxSailor" },
      {
        property: "og:description",
        content: "WHT · Pillar Two · Transfer pricing. Deterministic tax intelligence for multinationals.",
      },
      { property: "og:url", content: "/corporations" },
    ],
    links: [{ rel: "canonical", href: "/corporations" }],
  }),
  component: CorpPage,
});

const useCases = [
  {
    icon: Globe2,
    title: "Withholding Tax Routing",
    body: "Optimal dividend, interest, and royalty flows across 438 treaty edges. See exactly which holding structure minimizes WHT — with the treaty article cited on every step.",
  },
  {
    icon: Layers,
    title: "Pillar Two Modeling",
    body: "GloBE effective tax rate simulation per jurisdiction. QDMTT, IIR, UTPR modeling with legislative source citations.",
  },
  {
    icon: Scale,
    title: "Transfer Pricing Support",
    body: "Benchmark treaty-permitted arm's-length ranges. Import your ERP allocation and see edge-by-edge exposure.",
  },
  {
    icon: ShieldCheck,
    title: "Audit-Grade Documentation",
    body: "Every route ships with a citation trail regulators can follow. No hallucinated case law. Ever.",
  },
];

function CorpPage() {
  return (
    <>
      <section className="border-b border-navy/10 bg-white px-6 pb-16 pt-16 md:pt-24">
        <div className="mx-auto max-w-7xl">
          <p className="mb-6 font-mono text-xs uppercase tracking-widest text-steel">
            03 · For Corporations & Tax Departments
          </p>
          <h1 className="max-w-4xl font-serif text-5xl leading-[1.05] text-navy md:text-6xl lg:text-7xl">
            WHT. Pillar Two. <span className="text-steel">Treaty routing.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-navy/70">
            Multinational groups run treaty routing on spreadsheets, in Big Four decks,
            and in Excel + tribal knowledge. We compiled the graph so your in-house team
            can model, cite, and defend positions without a €200k engagement.
          </p>
          <div className="mt-10">
            <LeadDialog
              audience="corporations"
              trigger={
                <button className="inline-flex items-center gap-2 rounded-sm bg-navy px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-steel">
                  Book a demo <ArrowRight className="size-4" />
                </button>
              }
            />
          </div>
        </div>
      </section>

      <section className="border-b border-navy/10 bg-ghost px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-steel">Use cases</p>
          <h2 className="max-w-3xl font-serif text-4xl text-navy md:text-5xl">
            Four workflows, one graph.
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {useCases.map((u) => (
              <div key={u.title} className="rounded-md border border-navy/10 bg-white p-8">
                <div className="grid size-12 place-items-center rounded-sm bg-ghost text-steel">
                  <u.icon className="size-6" />
                </div>
                <h3 className="mt-6 font-serif text-2xl text-navy">{u.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-navy/70">{u.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy px-6 py-24 text-white">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1.3fr] lg:items-center">
          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-widest text-teal">
              A worked example
            </p>
            <h2 className="font-serif text-4xl md:text-5xl">
              DE parent → SG holdco → BR opco
            </h2>
            <p className="mt-6 text-white/70">
              5% WHT vs. 25% headline. €4.2M/yr saved on €30M annual dividend flow.
              Every citation clickable, every article referenced.
            </p>
          </div>
          <div className="rounded-md border border-white/10 bg-white/5 p-6 font-mono text-sm">
            <p className="text-white/40">// route.optimize({`{`}from: "DE", to: "BR"{`}`})</p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/60">DE → BR (direct)</span>
                <span className="text-destructive">τ = 25%</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/60">DE → NL → BR</span>
                <span className="text-white/50">τ = 15%</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/60">DE → CH → BR</span>
                <span className="text-white/50">τ = 12%</span>
              </div>
              <div className="flex justify-between rounded-sm bg-teal/15 p-2">
                <span className="text-teal">DE → SG → BR (optimal)</span>
                <span className="text-teal">τ = 5%</span>
              </div>
            </div>
            <p className="mt-6 text-xs text-white/40">
              Cited: DTA DE-SG Art. 10 §2 · DTA SG-BR Art. 10 §2 · Effective 2024-01-01
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-serif text-4xl text-navy md:text-5xl">
            Bring us your hardest case.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-navy/70">
            60-minute demo. We model a live scenario from your group and hand you the citations.
          </p>
          <div className="mt-10 flex justify-center">
            <LeadDialog
              audience="corporations"
              trigger={
                <button className="inline-flex items-center gap-2 rounded-sm bg-navy px-7 py-4 text-sm font-medium text-white transition-colors hover:bg-steel">
                  Request a demo <ArrowRight className="size-4" />
                </button>
              }
            />
          </div>
        </div>
      </section>
    </>
  );
}
