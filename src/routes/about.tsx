import { createFileRoute } from "@tanstack/react-router";
import angelImg from "@/assets/team-angel.jpg";
import hristoImg from "@/assets/team-hristo.jpg";
import nicolasImg from "@/assets/team-nicolas.jpg";
import petarImg from "@/assets/team-petar.jpg";
import { LeadDialog } from "@/components/site/LeadForm";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — TaxSailor" },
      {
        name: "description",
        content:
          "TaxSailor is built in Munich by four founders bridging tax expertise, computational modeling, and cross-border capital.",
      },
      { property: "og:title", content: "About — TaxSailor" },
      { property: "og:description", content: "Four founders. Munich. Building the tax graph." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

const team = [
  {
    img: nicolasImg,
    name: "Nicolas Seitz",
    role: "Co-Founder · Tax & Advisory",
    bio: "Tax practitioner. Built the treaty corpus and validation methodology behind TaxSailor.",
  },
  {
    img: hristoImg,
    name: "Hristo Andreev",
    role: "Co-Founder · Product & Strategy",
    bio: "Cross-border product operator. Owns roadmap, GTM, and pilot partnerships.",
  },
  {
    img: angelImg,
    name: "Angel Barov",
    role: "Co-Founder · Engineering",
    bio: "Systems and graph engineering. Author of the log-transformed pathing engine.",
  },
  {
    img: petarImg,
    name: "Petar Nedyalkov",
    role: "Co-Founder · Data & Research",
    bio: "3,000+ document ingestion pipeline and jurisdiction-versioning system.",
  },
];

function AboutPage() {
  return (
    <>
      <section className="border-b border-navy/10 bg-white px-6 pb-16 pt-16 md:pt-24">
        <div className="mx-auto max-w-7xl">
          <p className="mb-6 font-mono text-xs uppercase tracking-widest text-teal">
            About TaxSailor
          </p>
          <h1 className="max-w-4xl font-serif text-5xl leading-[1.05] text-navy md:text-6xl lg:text-7xl">
            Four founders. Munich. <span className="text-teal">One graph.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-navy/70">
            TaxSailor is a Munich-based startup building the world's first computational
            tax intelligence platform. We're a mix of tax practitioners, engineers, and
            product operators — building the tool we wished existed for our own cases.
          </p>
        </div>
      </section>

      <section className="border-b border-navy/10 bg-ghost px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-teal">The crew</p>
          <h2 className="max-w-3xl font-serif text-4xl text-navy md:text-5xl">
            Tax expertise × computational engineering.
          </h2>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((m) => (
              <div key={m.name} className="group">
                <div className="aspect-square overflow-hidden rounded-md bg-navy/5">
                  <img
                    src={m.img}
                    alt={`Portrait of ${m.name}`}
                    loading="lazy"
                    className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
                  />
                </div>
                <p className="mt-5 font-serif text-xl text-navy">{m.name}</p>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-teal">
                  {m.role}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-navy/60">{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy px-6 py-24 text-white">
        <div className="mx-auto max-w-4xl">
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-teal">Thesis</p>
          <h2 className="font-serif text-4xl md:text-5xl">
            Tax is a graph problem waiting to be solved.
          </h2>
          <p className="mt-6 max-w-2xl text-white/70">
            131 sovereign jurisdictions, 438 bilateral treaties, 3,000+ interpretive
            documents — with residency, sourcing, and anti-avoidance rules as edge weights.
            LLMs approximate this. We compute it.
          </p>
          <p className="mt-6 max-w-2xl text-white/70">
            Our thesis is simple: cross-border wealth grows faster than advisory
            capacity. Deterministic tooling with citations is the only way to close
            the gap without hallucinating law.
          </p>
        </div>
      </section>

      <section className="bg-white px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-serif text-4xl text-navy md:text-5xl">Come sail with us.</h2>
          <p className="mx-auto mt-6 max-w-xl text-navy/70">
            Investors, pilot firms, and prospective hires all start with a conversation.
          </p>
          <div className="mt-10 flex justify-center">
            <LeadDialog
              audience="general"
              trigger={
                <button className="inline-flex items-center gap-2 rounded-sm bg-navy px-7 py-4 text-sm font-medium text-white transition-colors hover:bg-teal">
                  Contact us <ArrowRight className="size-4" />
                </button>
              }
            />
          </div>
        </div>
      </section>
    </>
  );
}
