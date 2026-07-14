import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Docs — TaxSailor" },
      { name: "description", content: "How TaxSailor works: the graph engine, corpus, workspace, and trust posture." },
      { property: "og:title", content: "TaxSailor Docs" },
      { property: "og:description", content: "Product, method, and trust — one article each." },
    ],
    links: [{ rel: "canonical", href: "/docs" }],
  }),
  component: DocsLayout,
});

function DocsLayout() {
  return (
    <div className="bg-white">
      <div className="border-b border-navy/10 bg-ghost px-6 py-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-teal">Documentation</p>
            <h1 className="mt-2 font-serif text-3xl text-navy md:text-4xl">Knowledge center</h1>
          </div>
          <Link
            to="/docs"
            className="hidden font-mono text-xs uppercase tracking-widest text-navy/60 hover:text-teal md:block"
          >
            ← All articles
          </Link>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
