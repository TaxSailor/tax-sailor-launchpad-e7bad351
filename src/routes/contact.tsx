import { createFileRoute } from "@tanstack/react-router";
import { LeadForm } from "@/components/site/LeadForm";
import { useState } from "react";
import { Mail, MapPin, Rocket, GitBranch, Building2, User } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — TaxSailor" },
      {
        name: "description",
        content:
          "Reach TaxSailor — investors, pilot firms, corporations, and individuals. Munich-based, replies within 48 hours.",
      },
      { property: "og:title", content: "Contact TaxSailor" },
      { property: "og:description", content: "Munich-based. Replies within 48h." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

type Audience = "investors" | "pilot" | "corporations" | "individuals";
const tabs: Array<{ id: Audience; label: string; icon: typeof Rocket }> = [
  { id: "pilot", label: "Pilot firm", icon: GitBranch },
  { id: "investors", label: "Investor", icon: Rocket },
  { id: "corporations", label: "Corporation", icon: Building2 },
  { id: "individuals", label: "Individual", icon: User },
];

function ContactPage() {
  const [active, setActive] = useState<Audience>("pilot");

  return (
    <>
      <section className="border-b border-navy/10 bg-white px-6 pb-16 pt-16 md:pt-24">
        <div className="mx-auto max-w-7xl">
          <p className="mb-6 font-mono text-xs uppercase tracking-widest text-teal">Contact</p>
          <h1 className="max-w-4xl font-serif text-5xl leading-[1.05] text-navy md:text-6xl lg:text-7xl">
            Say hello. We reply within <span className="text-teal">48 hours.</span>
          </h1>
        </div>
      </section>

      <section className="bg-ghost px-6 py-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.5fr]">
          <aside className="space-y-8">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-teal">Office</p>
              <p className="mt-3 flex items-start gap-2 text-navy/70">
                <MapPin className="mt-0.5 size-4 text-teal" />
                <span>Munich, Germany</span>
              </p>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-teal">Email</p>
              <p className="mt-3 flex items-start gap-2 text-navy/70">
                <Mail className="mt-0.5 size-4 text-teal" />
                <a href="mailto:hello@taxsailor.com" className="hover:text-teal">
                  hello@taxsailor.com
                </a>
              </p>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-teal">
                Response time
              </p>
              <p className="mt-3 text-sm text-navy/60">
                Investors: same day. Pilot firms & corporations: within 48h. Individuals: 3–5 business days.
              </p>
            </div>
          </aside>

          <div className="rounded-md border border-navy/10 bg-white p-8">
            <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-navy/50">
              I'm reaching out as
            </p>
            <div className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActive(t.id)}
                  className={`flex flex-col items-start gap-2 rounded-sm border px-3 py-3 text-left text-sm transition-colors ${
                    active === t.id
                      ? "border-teal bg-teal/5 text-navy"
                      : "border-navy/10 bg-white text-navy/60 hover:border-navy/25"
                  }`}
                >
                  <t.icon className="size-4" />
                  <span className="font-medium">{t.label}</span>
                </button>
              ))}
            </div>
            <LeadForm audience={active} />
          </div>
        </div>
      </section>
    </>
  );
}
