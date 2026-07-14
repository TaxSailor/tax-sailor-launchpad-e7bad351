import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Home, Plane, Landmark, HeartHandshake } from "lucide-react";
import { LeadDialog } from "@/components/site/LeadForm";

export const Route = createFileRoute("/individuals")({
  head: () => ({
    meta: [
      { title: "Individuals — TaxSailor" },
      {
        name: "description",
        content:
          "Cross-border residency, §6/§2 AStG exit tax, and ErbStG estate scenarios modeled with citations. For HNW individuals and family offices.",
      },
      { property: "og:title", content: "Individuals — TaxSailor" },
      {
        property: "og:description",
        content: "Residency · Exit tax · Estate. Cross-border scenarios you can audit.",
      },
      { property: "og:url", content: "/individuals" },
    ],
    links: [{ rel: "canonical", href: "/individuals" }],
  }),
  component: IndPage,
});

const scenarios = [
  {
    icon: Plane,
    title: "Change of residency",
    body: "Model tax exposure across proposed jurisdictions before you move. Includes exit tax, deemed disposal, and treaty tie-breakers.",
  },
  {
    icon: Landmark,
    title: "§6 / §2 AStG exit tax",
    body: "German exit tax on shareholdings ≥1%. See installments, deferrals, and treaty overrides — with §-level citations.",
  },
  {
    icon: HeartHandshake,
    title: "ErbStG cross-border estate",
    body: "Inheritance and gift tax across jurisdictions. Beneficiary residency, situs rules, and DTA overrides modeled.",
  },
  {
    icon: Home,
    title: "Property & rental income",
    body: "OECD Art. 6 property income allocation. Withholding, credit vs. exemption, and net-basis election modeling.",
  },
];

function IndPage() {
  return (
    <>
      <section className="border-b border-navy/10 bg-white px-6 pb-16 pt-16 md:pt-24">
        <div className="mx-auto max-w-7xl">
          <p className="mb-6 font-mono text-xs uppercase tracking-widest text-amber-brand">
            04 · For Individuals & Family Offices
          </p>
          <h1 className="max-w-4xl font-serif text-5xl leading-[1.05] text-navy md:text-6xl lg:text-7xl">
            Your <span className="text-amber-brand">life</span> crosses borders. So should your tax plan.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-navy/70">
            Relocations, exit taxes, estate transfers, remote work — cross-border personal
            tax is where most advisors freeze. We built the model so yours doesn't.
          </p>
          <div className="mt-10">
            <LeadDialog
              audience="individuals"
              trigger={
                <button className="inline-flex items-center gap-2 rounded-sm bg-navy px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-amber-brand">
                  Request access <ArrowRight className="size-4" />
                </button>
              }
            />
          </div>
        </div>
      </section>

      <section className="border-b border-navy/10 bg-ghost px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-amber-brand">
            Scenarios
          </p>
          <h2 className="max-w-3xl font-serif text-4xl text-navy md:text-5xl">
            Model it before you commit to it.
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {scenarios.map((s) => (
              <div key={s.title} className="rounded-md border border-navy/10 bg-white p-8">
                <div className="grid size-12 place-items-center rounded-sm bg-ghost text-amber-brand">
                  <s.icon className="size-6" />
                </div>
                <h3 className="mt-6 font-serif text-2xl text-navy">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-navy/70">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy px-6 py-24 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-amber-brand">
            Note
          </p>
          <h2 className="font-serif text-3xl md:text-4xl">
            TaxSailor is intelligence, not advice.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-white/70">
            We give you and your advisor an audit-ready model with primary-source citations.
            Regulated advice remains with your Steuerberater — we make their work faster,
            defensible, and 10× more thorough.
          </p>
          <div className="mt-10">
            <LeadDialog
              audience="individuals"
              trigger={
                <button className="inline-flex items-center gap-2 rounded-sm bg-amber-brand px-7 py-4 text-sm font-medium text-navy transition-colors hover:bg-teal">
                  Get started <ArrowRight className="size-4" />
                </button>
              }
            />
          </div>
        </div>
      </section>
    </>
  );
}
