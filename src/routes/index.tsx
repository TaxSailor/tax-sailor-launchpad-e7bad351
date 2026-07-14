import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowRight, ArrowDown, ShieldCheck, GitBranch, LineChart } from "lucide-react";
import { LeadDialog } from "@/components/site/LeadForm";
import { StatBar } from "@/components/site/StatBar";
import heroImage from "@/assets/network-city.jpg.asset.json";
import munichFacade from "@/assets/munich-facade.jpg.asset.json";
import munichOlympia from "@/assets/munich-olympiapark.jpg.asset.json";

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
      { property: "og:image", content: heroImage.url },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

const audiences = [
  {
    to: "/investors" as const,
    kicker: "For Investors",
    title: "Fund the graph",
    body: "Seed round underway. €105k friends-and-family closed. Data room, thesis, and traction on request.",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    to: "/pilot" as const,
    kicker: "For Advisory Firms",
    title: "The Q3 2026 pilot",
    body: "5–10 boutique DACH advisory firms. 30-day free pilot. Then €149 / €249 / €499 per seat.",
    image:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=80",
  },
  {
    to: "/corporations" as const,
    kicker: "For Corporations",
    title: "WHT · Pillar Two",
    body: "Group-level withholding, treaty routing, and OECD compliance across 131 jurisdictions.",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
  },
  {
    to: "/individuals" as const,
    kicker: "For Individuals",
    title: "Residency & estate",
    body: "§6 AStG exit, §2 AStG extended limited, ErbStG cross-border. Math you can audit.",
    image:
      "https://images.unsplash.com/photo-1573497491765-dccce02b29df?auto=format&fit=crop&w=1200&q=80",
  },
];

const easeOut = [0.25, 0.46, 0.45, 0.94] as const;

function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <>
      {/* HERO — full-viewport editorial */}
      <section
        ref={heroRef}
        className="relative -mt-16 h-[100svh] overflow-hidden"
      >
        <motion.div className="absolute inset-0" style={{ y: heroY }}>
          <img
            src={heroImage.url}
            alt="Global financial network at dusk"
            className="h-[115%] w-full animate-ken-burns object-cover"
            width={1600}
            height={1200}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/80 via-navy/40 to-navy/85" />
        </motion.div>

        <motion.div
          className="container-full relative flex h-full flex-col justify-end pb-16 pt-24 md:pb-24"
          style={{ opacity: heroOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: easeOut }}
            className="max-w-3xl"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mb-6 font-mono text-[11px] font-medium uppercase tracking-editorial text-teal"
            >
              Computational Tax Intelligence · v0.1
            </motion.p>
            <h1 className="mb-8 font-serif text-5xl leading-[0.95] tracking-tight text-white md:text-7xl lg:text-8xl">
              Navigate borders.
              <br />
              <span className="italic font-normal text-teal">Keep more.</span>
              <br />
              Prove everything.
            </h1>
            <p className="mb-10 max-w-xl text-base leading-relaxed text-white/75 md:text-lg">
              The world's first proof-carrying tax platform. 131 jurisdictions,
              438 treaty edges, log-transformed Dijkstra routing — the same math
              that steers submarines, applied to cross-border capital.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <LeadDialog
                audience="pilot"
                trigger={
                  <button className="inline-flex items-center justify-center gap-3 rounded-none bg-white px-10 py-5 text-[11px] font-medium uppercase tracking-editorial text-navy transition-colors hover:bg-teal hover:text-white">
                    Request pilot access <ArrowRight className="size-4" />
                  </button>
                }
              />
              <LeadDialog
                audience="investors"
                trigger={
                  <button className="inline-flex items-center justify-center gap-3 rounded-none border border-white/40 px-10 py-5 text-[11px] font-medium uppercase tracking-editorial text-white transition-colors hover:bg-white/10">
                    Book investor call
                  </button>
                }
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
          >
            <span className="font-mono text-[10px] uppercase tracking-editorial text-white/50">
              Scroll
            </span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowDown className="size-4 text-white/50" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      <StatBar />

      {/* FEATURED — the algorithm */}
      <section className="py-24 md:py-32">
        <div className="container-full">
          <div className="grid items-center gap-10 md:grid-cols-2 lg:gap-20">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, ease: easeOut }}
              className="image-reveal relative aspect-[4/5] overflow-hidden"
            >
              <img
                src={munichFacade.url}
                alt="Glass facade in Munich financial district"
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/50 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 font-mono text-xs uppercase tracking-editorial text-white/80">
                <span className="text-teal">●</span> W = −ln(1 − τ)
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, delay: 0.15, ease: easeOut }}
            >
              <p className="mb-4 font-mono text-[11px] font-medium uppercase tracking-editorial text-teal">
                The Algorithmic Kernel
              </p>
              <h2 className="mb-6 font-serif text-4xl leading-[1.05] text-navy md:text-5xl lg:text-6xl">
                Tax planning, rewritten as a{" "}
                <span className="italic">solved graph problem</span>.
              </h2>
              <p className="mb-8 max-w-md leading-relaxed text-navy/70">
                We convert 438 international treaty edges into a weighted graph
                with a log-transformed cost function. Optimal cross-border
                paths become provably shortest — not heuristically good, not
                LLM-guessed. Every route ships with the article, paragraph,
                and effective date it depends on.
              </p>
              <Link
                to="/about"
                className="inline-flex items-center gap-3 border-b border-navy pb-2 text-[11px] font-medium uppercase tracking-editorial text-navy transition-colors hover:border-teal hover:text-teal"
              >
                Read the technical brief <ArrowRight className="size-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* AUDIENCE ROUTER — editorial cards */}
      <section className="bg-ghost py-24 md:py-32">
        <div className="container-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-editorial text-teal">
              Select your route
            </p>
            <h2 className="mx-auto max-w-2xl font-serif text-4xl leading-[1.1] text-navy md:text-5xl">
              Four audiences. <span className="italic">One graph.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {audiences.map((a, i) => (
              <motion.div
                key={a.to}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: easeOut }}
              >
                <Link to={a.to} className="group block">
                  <div className="image-reveal relative mb-5 aspect-[3/4] overflow-hidden bg-navy/5">
                    <img
                      src={a.image}
                      alt={a.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-navy/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  </div>
                  <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-editorial text-teal">
                    {a.kicker}
                  </p>
                  <h3 className="mb-2 font-serif text-2xl leading-tight text-navy">
                    {a.title}
                  </h3>
                  <p className="mb-4 text-sm leading-relaxed text-navy/60">
                    {a.body}
                  </p>
                  <span className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-editorial text-navy transition-colors group-hover:text-teal">
                    Enter <ArrowRight className="size-3.5" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PROOF — dark navy manifesto */}
      <section className="relative overflow-hidden bg-navy py-24 text-white md:py-32">
        <div className="container-full">
          <div className="grid items-center gap-16 lg:grid-cols-[1fr_1.1fr]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: easeOut }}
            >
              <p className="mb-4 font-mono text-[11px] font-medium uppercase tracking-editorial text-teal">
                Why it holds up in an audit
              </p>
              <h2 className="mb-6 font-serif text-4xl leading-[1.05] md:text-5xl lg:text-6xl">
                Every answer, <span className="italic">cited</span>.
                <br />
                Every route, <span className="italic">provable</span>.
              </h2>
              <p className="max-w-lg leading-relaxed text-white/70">
                LLM-only tax tools hallucinate. Ours doesn't. Recommendations
                are computed on a versioned treaty graph and ship with
                paragraph-level citations to primary sources — advisor-grade,
                defensible, and reproducible.
              </p>
            </motion.div>

            <div className="grid gap-px bg-white/10">
              {[
                {
                  icon: ShieldCheck,
                  title: "Primary-source citations",
                  body: "Article, paragraph, effective date — on every output line.",
                },
                {
                  icon: GitBranch,
                  title: "Versioned graph",
                  body: "Every OECD update, protocol, and domestic change is timestamped.",
                },
                {
                  icon: LineChart,
                  title: "Deterministic pathing",
                  body: "Shortest-path proof, not stochastic best guess.",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex gap-5 bg-navy p-8"
                >
                  <item.icon className="size-6 shrink-0 text-teal" />
                  <div>
                    <p className="font-serif text-xl">{item.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-white/60">
                      {item.body}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MUNICH — origin story */}
      <section className="py-24 md:py-32">
        <div className="container-full">
          <div className="grid items-center gap-10 md:grid-cols-[1fr_1.2fr] lg:gap-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, ease: easeOut }}
              className="order-2 md:order-1"
            >
              <p className="mb-4 font-mono text-[11px] font-medium uppercase tracking-editorial text-teal">
                Founded in Munich
              </p>
              <h2 className="mb-6 font-serif text-4xl leading-[1.05] text-navy md:text-5xl">
                Built where cross-border{" "}
                <span className="italic">actually happens</span>.
              </h2>
              <p className="mb-6 leading-relaxed text-navy/70">
                Four founders. Backgrounds in international tax, quantitative
                finance, and applied mathematics. We built TaxSailor because
                the tools our advisors were using couldn't survive a serious
                audit — and the ones that could weren't computable.
              </p>
              <Link
                to="/about"
                className="inline-flex items-center gap-3 border-b border-navy pb-2 text-[11px] font-medium uppercase tracking-editorial text-navy transition-colors hover:border-teal hover:text-teal"
              >
                Meet the crew <ArrowRight className="size-4" />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.9, ease: easeOut }}
              className="image-reveal relative order-1 aspect-[4/3] overflow-hidden md:order-2"
            >
              <img
                src={munichOlympia.url}
                alt="Munich skyline"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-ghost py-24 md:py-32">
        <div className="container-narrow text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: easeOut }}
          >
            <p className="mb-6 font-mono text-[11px] font-medium uppercase tracking-editorial text-teal">
              Setting sail Q3 2026
            </p>
            <h2 className="mb-8 font-serif text-4xl leading-[1.1] text-navy md:text-5xl lg:text-6xl">
              Ready to <span className="italic">plot a route</span>?
            </h2>
            <p className="mx-auto mb-10 max-w-xl leading-relaxed text-navy/70">
              Whether you're an investor, an advisory firm, or a cross-border
              operator — start with a conversation.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <LeadDialog
                audience="general"
                trigger={
                  <button className="inline-flex items-center justify-center gap-3 rounded-none bg-navy px-10 py-5 text-[11px] font-medium uppercase tracking-editorial text-white transition-colors hover:bg-teal">
                    Contact TaxSailor <ArrowRight className="size-4" />
                  </button>
                }
              />
              <Link
                to="/about"
                className="inline-flex items-center justify-center gap-3 rounded-none border border-navy/30 px-10 py-5 text-[11px] font-medium uppercase tracking-editorial text-navy transition-colors hover:bg-white"
              >
                Read our story
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
