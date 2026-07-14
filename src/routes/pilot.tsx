import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { LeadDialog } from "@/components/site/LeadForm";

export const Route = createFileRoute("/pilot")({
  head: () => ({
    meta: [
      { title: "Pilot Program — TaxSailor" },
      {
        name: "description",
        content:
          "TaxSailor pilot: 30-day free access for 5–10 DACH boutique advisory firms. Q3 2026 cohort. Cross-border tax intelligence with primary-source citations.",
      },
      { property: "og:title", content: "TaxSailor Pilot Program — Q3 2026" },
      { property: "og:description", content: "5–10 DACH boutique advisory firms. 30-day free access." },
      { property: "og:url", content: "/pilot" },
    ],
    links: [{ rel: "canonical", href: "/pilot" }],
  }),
  component: PilotPage,
});

const tiers = [
  {
    name: "Solo",
    price: "€149",
    period: "/mo",
    tagline: "Single practitioner",
    features: [
      "Route optimization · 131 jurisdictions",
      "Primary-source citations",
      "Up to 20 cases / month",
      "Email support",
    ],
  },
  {
    name: "Practice",
    price: "€249",
    period: "/seat/mo",
    tagline: "Boutique firms 2–10 seats",
    features: [
      "Everything in Solo",
      "Team workspace & case sharing",
      "Unlimited cases",
      "Priority support · 24h SLA",
      "White-label client memos",
    ],
    featured: true,
  },
  {
    name: "Enterprise",
    price: "€499",
    period: "/seat/mo",
    tagline: "Multi-office / regulated",
    features: [
      "Everything in Practice",
      "SSO · SOC2 report",
      "Custom jurisdictions module",
      "Dedicated onboarding",
      "Direct line to founders",
    ],
  },
];

const timeline = [
  { week: "Week 0", title: "Onboarding", body: "1-hour call, seat setup, private Slack channel." },
  { week: "Weeks 1–2", title: "Run cases", body: "Bring your live cross-border matters. We shadow the first three." },
  { week: "Weeks 3–4", title: "Iterate", body: "Weekly product review. Your feedback ships that week." },
  { week: "Day 30", title: "Convert or walk", body: "No lock-in. Convert to a tier — or don't. Zero credit-card requirement to start." },
];

function PilotPage() {
  return (
    <>
      <section className="border-b border-navy/10 bg-white px-6 pb-16 pt-16 md:pt-24">
        <div className="mx-auto max-w-7xl">
          <p className="mb-6 font-mono text-xs uppercase tracking-widest text-emerald">
            02 · Pilot Program · Q3 2026
          </p>
          <h1 className="max-w-4xl font-serif text-5xl leading-[1.05] text-navy md:text-6xl lg:text-7xl">
            <span className="text-emerald">30 days</span>. 10 firms. Full access.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-navy/70">
            We're onboarding 5–10 DACH boutique tax advisory firms into our Q3 2026 pilot.
            Full platform access. Direct line to the founders. No credit card.
            Your feedback becomes v1.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <LeadDialog
              audience="pilot"
              trigger={
                <button className="inline-flex items-center gap-2 rounded-sm bg-navy px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-emerald">
                  Apply for the pilot <ArrowRight className="size-4" />
                </button>
              }
            />
          </div>
        </div>
      </section>

      <section className="border-b border-navy/10 bg-ghost px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-emerald">
            Post-pilot pricing
          </p>
          <h2 className="max-w-3xl font-serif text-4xl text-navy md:text-5xl">
            After 30 days, choose your tier.
          </h2>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {tiers.map((t) => (
              <div
                key={t.name}
                className={`flex flex-col rounded-md border p-8 ${
                  t.featured
                    ? "border-emerald bg-navy text-white shadow-[0_25px_70px_-30px_rgba(5,35,71,0.5)]"
                    : "border-navy/10 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className={`font-serif text-2xl ${t.featured ? "text-white" : "text-navy"}`}>
                    {t.name}
                  </h3>
                  {t.featured && (
                    <span className="rounded-sm bg-emerald px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-navy">
                      Recommended
                    </span>
                  )}
                </div>
                <p className={`mt-1 text-sm ${t.featured ? "text-white/60" : "text-navy/50"}`}>
                  {t.tagline}
                </p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className={`font-mono text-4xl ${t.featured ? "text-emerald" : "text-navy"}`}>
                    {t.price}
                  </span>
                  <span className={`text-sm ${t.featured ? "text-white/50" : "text-navy/50"}`}>
                    {t.period}
                  </span>
                </div>
                <ul className="mt-8 flex-1 space-y-3">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check
                        className={`mt-0.5 size-4 shrink-0 ${t.featured ? "text-emerald" : "text-emerald"}`}
                      />
                      <span className={t.featured ? "text-white/80" : "text-navy/70"}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-navy/10 bg-white px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-emerald">
            The 30 days
          </p>
          <h2 className="max-w-3xl font-serif text-4xl text-navy md:text-5xl">
            What actually happens.
          </h2>
          <div className="mt-12 grid gap-px overflow-hidden rounded-md border border-navy/10 bg-navy/10 md:grid-cols-4">
            {timeline.map((t) => (
              <div key={t.title} className="bg-white p-8">
                <p className="font-mono text-xs uppercase tracking-widest text-emerald">{t.week}</p>
                <h3 className="mt-3 font-serif text-xl text-navy">{t.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-navy/60">{t.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy px-6 py-24 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-emerald">
            Fit check
          </p>
          <h2 className="font-serif text-4xl md:text-5xl">Is this you?</h2>
          <div className="mx-auto mt-10 grid max-w-3xl gap-3 text-left">
            {[
              "You're a Steuerberater / Wirtschaftsprüfer in a boutique firm (2–20 seats).",
              "You see cross-border cases weekly (DE↔CH, DE↔AE, DE↔SG).",
              "You've hit the wall with Big Four costs and LLM hallucinations.",
              "You're okay giving 30 minutes/week for feedback in exchange for early access.",
            ].map((line) => (
              <div key={line} className="flex items-start gap-3 rounded-sm border border-white/10 bg-white/5 p-4">
                <Check className="mt-0.5 size-5 shrink-0 text-emerald" />
                <p className="text-sm text-white/80">{line}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <LeadDialog
              audience="pilot"
              trigger={
                <button className="inline-flex items-center gap-2 rounded-sm bg-emerald px-7 py-4 text-sm font-medium text-navy transition-colors hover:bg-teal">
                  Apply for the pilot <ArrowRight className="size-4" />
                </button>
              }
            />
          </div>
        </div>
      </section>
    </>
  );
}
