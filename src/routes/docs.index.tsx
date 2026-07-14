import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import { articles, categories } from "@/lib/docs/articles";

export const Route = createFileRoute("/docs/")({
  head: () => ({
    meta: [
      { title: "Docs — TaxSailor" },
      { name: "description", content: "Every article on the TaxSailor graph engine, workspace, and trust posture." },
    ],
    links: [{ rel: "canonical", href: "/docs" }],
  }),
  component: DocsIndex,
});

function DocsIndex() {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return articles;
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(needle) ||
        a.summary.toLowerCase().includes(needle) ||
        a.body.toLowerCase().includes(needle),
    );
  }, [q]);

  return (
    <section className="px-6 py-14">
      <div className="mx-auto max-w-7xl">
        <div className="relative mb-12 max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-navy/40" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search the knowledge center"
            className="w-full rounded-full border border-navy/15 bg-white py-3 pl-11 pr-4 font-sans text-sm text-navy placeholder:text-navy/40 focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20"
            aria-label="Search articles"
          />
        </div>

        {categories.map((cat) => {
          const items = filtered.filter((a) => a.category === cat.name);
          if (items.length === 0) return null;
          return (
            <div key={cat.name} className="mb-14">
              <div className="mb-6 grid gap-1 border-b border-navy/10 pb-4">
                <p className="font-mono text-xs uppercase tracking-widest text-teal">{cat.name}</p>
                <p className="font-sans text-sm text-navy/70">{cat.description}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.map((a) => (
                  <Link
                    key={a.slug}
                    to="/docs/$slug"
                    params={{ slug: a.slug }}
                    className="group grid gap-3 rounded-2xl border border-navy/10 bg-white p-6 transition-colors hover:border-teal"
                  >
                    <p className="font-mono text-[11px] uppercase tracking-widest text-navy/50">
                      {a.readingMinutes} min read
                    </p>
                    <h3 className="font-serif text-xl text-navy">{a.title}</h3>
                    <p className="font-sans text-sm leading-relaxed text-navy/70">{a.summary}</p>
                    <span className="mt-2 inline-flex items-center gap-1 font-mono text-xs uppercase tracking-widest text-teal">
                      Read <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-navy/15 bg-ghost p-12 text-center">
            <p className="font-serif text-lg text-navy">No articles match "{q}".</p>
            <p className="mt-2 font-sans text-sm text-navy/60">
              Try a different search, or <Link to="/contact" className="text-teal underline">ask us directly</Link>.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
