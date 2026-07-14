import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import {
  PRICING_TIERS,
  PRICING_PURCHASE_CTA_LABEL,
  PRICING_CONTACT_DISPLAY_EMAIL,
  buildPricingMailtoHref,
  type PricingTier,
} from "@/lib/pricing";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — TaxSailor" },
      {
        name: "description",
        content:
          "Transparent pricing for TaxSailor: consumer reports, advisor licences, premium packages, and enterprise infrastructure.",
      },
      { property: "og:title", content: "Pricing — TaxSailor" },
      {
        property: "og:description",
        content:
          "Consumer reports from €99. Advisor licences from €199/mo. Premium and enterprise available.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen bg-white">
        <section className="mx-auto max-w-7xl px-6 pt-16 pb-8 md:pt-24 md:pb-12">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-teal">
            §4 · Pricing
          </p>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-[1.05] text-navy md:text-6xl">
            Four plans. One optimisation graph.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-navy/70">
            Contact-to-pay pricing while we finalise billing. Every plan runs the same Dijkstra
            engine; the difference is scope, deliverables, and support.
          </p>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-16 md:grid-cols-2 md:pb-24 xl:grid-cols-4">
          {PRICING_TIERS.map((tier) => (
            <TierCard key={tier.id} tier={tier} />
          ))}
        </section>

        <section className="border-t border-navy/10 bg-ghost">
          <div className="mx-auto max-w-7xl px-6 py-12 md:py-20">
            <div className="grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-end">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-teal">
                  Talk to sales
                </p>
                <h2 className="mt-3 max-w-2xl font-serif text-3xl leading-tight text-navy md:text-4xl">
                  Not sure which plan? We'll scope it with you.
                </h2>
                <p className="mt-4 max-w-xl text-navy/70">
                  Every engagement starts with a 20-minute call. We map your case to the graph,
                  size the deliverable, and quote a fixed price before any work begins.
                </p>
              </div>
              <div className="rounded-sm border border-navy/15 bg-white p-6">
                <p className="font-mono text-[11px] uppercase tracking-widest text-navy/50">
                  Sales contact
                </p>
                <p className="mt-2 font-serif text-2xl text-navy">
                  {PRICING_CONTACT_DISPLAY_EMAIL}
                </p>
                <a
                  href={buildPricingMailtoHref()}
                  className="mt-5 inline-flex w-full items-center justify-center rounded-sm bg-navy px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-teal"
                >
                  Start a conversation
                </a>
                <Link
                  to="/contact"
                  className="mt-3 inline-flex w-full items-center justify-center rounded-sm border border-navy/15 px-5 py-3 text-sm font-medium text-navy transition-colors hover:border-teal hover:text-teal"
                >
                  Or use the contact form
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function TierCard({ tier }: { tier: PricingTier }) {
  const popular = tier.mostPopular;
  return (
    <div
      className={`relative flex flex-col rounded-sm border p-6 transition-colors ${
        popular
          ? "border-teal bg-white shadow-[0_1px_0_hsl(var(--navy)/0.06)]"
          : "border-navy/15 bg-white"
      }`}
    >
      {popular && (
        <span className="absolute -top-3 left-6 rounded-sm bg-teal px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-white">
          Most popular
        </span>
      )}
      <p className="font-mono text-[11px] uppercase tracking-widest text-navy/50">
        {tier.audience}
      </p>
      <h3 className="mt-2 font-serif text-2xl text-navy">{tier.name}</h3>
      <p className="mt-4 font-serif text-3xl text-navy">{tier.priceDisplay}</p>
      <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-navy/50">
        {cadenceLabel(tier.cadence)}
      </p>
      <ul className="mt-6 space-y-2.5 text-sm text-navy/80">
        {tier.headline.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-teal" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex-1" />
      <a
        href={buildPricingMailtoHref(tier)}
        className={`mt-4 inline-flex items-center justify-center rounded-sm px-4 py-2.5 text-sm font-medium transition-colors ${
          popular
            ? "bg-navy text-white hover:bg-teal"
            : "border border-navy/20 text-navy hover:border-teal hover:text-teal"
        }`}
      >
        {PRICING_PURCHASE_CTA_LABEL}
      </a>
    </div>
  );
}

function cadenceLabel(c: PricingTier["cadence"]) {
  switch (c) {
    case "per_report":
      return "per report";
    case "per_month":
      return "per month";
    case "per_package":
      return "per package";
    case "per_year":
      return "per year";
  }
}
