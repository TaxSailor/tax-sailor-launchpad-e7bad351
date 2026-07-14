import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { articles, getArticle, getAdjacent } from "@/lib/docs/articles";

export const Route = createFileRoute("/docs/$slug")({
  loader: ({ params }) => {
    const article = getArticle(params.slug);
    if (!article) throw notFound();
    return { article };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Not found — TaxSailor Docs" }, { name: "robots", content: "noindex" }] };
    }
    const { article } = loaderData;
    return {
      meta: [
        { title: `${article.title} — TaxSailor Docs` },
        { name: "description", content: article.summary },
        { property: "og:title", content: article.title },
        { property: "og:description", content: article.summary },
      ],
      links: [{ rel: "canonical", href: `/docs/${article.slug}` }],
    };
  },
  notFoundComponent: DocNotFound,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="font-serif text-2xl text-navy">Something went wrong.</p>
      <p className="mt-2 font-sans text-sm text-navy/60">{error.message}</p>
    </div>
  ),
  component: ArticlePage,
});

function DocNotFound() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-widest text-teal">404</p>
        <h2 className="mt-2 font-serif text-3xl text-navy">Article not found.</h2>
        <p className="mt-3 font-sans text-navy/70">
          The doc you are looking for may have moved. Browse the full index below.
        </p>
        <Link
          to="/docs"
          className="mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-teal"
        >
          <ArrowLeft className="size-3" /> All articles
        </Link>
      </div>
    </section>
  );
}

function ArticlePage() {
  const { article } = Route.useLoaderData();
  const { prev, next } = getAdjacent(article.slug);

  return (
    <section className="px-6 py-14">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-widest text-navy/50">In this section</p>
          <nav className="grid gap-1">
            {articles
              .filter((a) => a.category === article.category)
              .map((a) => (
                <Link
                  key={a.slug}
                  to="/docs/$slug"
                  params={{ slug: a.slug }}
                  className="rounded-md px-2 py-1.5 font-sans text-sm text-navy/60 transition-colors hover:bg-ghost hover:text-navy"
                  activeProps={{ className: "bg-ghost text-navy font-medium" }}
                >
                  {a.title}
                </Link>
              ))}
          </nav>
        </aside>

        <article className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-widest text-teal">
            {article.category} · {article.readingMinutes} min read
          </p>
          <h1 className="mt-3 font-serif text-4xl text-navy md:text-5xl">{article.title}</h1>
          <p className="mt-4 font-serif text-lg text-navy/70">{article.summary}</p>

          <div className="doc-body mt-10 font-sans text-[15px] leading-relaxed text-navy/85">
            <ReactMarkdown
              components={{
                h2: ({ node, ...p }) => <h2 className="mt-10 mb-4 font-serif text-2xl text-navy" {...p} />,
                h3: ({ node, ...p }) => <h3 className="mt-8 mb-3 font-serif text-xl text-navy" {...p} />,
                p: ({ node, ...p }) => <p className="my-4" {...p} />,
                a: ({ node, ...p }) => <a className="text-teal underline-offset-2 hover:underline" {...p} />,
                strong: ({ node, ...p }) => <strong className="font-semibold text-navy" {...p} />,
                ul: ({ node, ...p }) => <ul className="my-4 grid gap-2 pl-5 list-disc marker:text-teal" {...p} />,
                ol: ({ node, ...p }) => <ol className="my-4 grid gap-2 pl-5 list-decimal marker:text-teal" {...p} />,
                li: ({ node, ...p }) => <li className="pl-1" {...p} />,
                code: ({ node, ...p }) => <code className="rounded bg-ghost px-1.5 py-0.5 font-mono text-[13px] text-navy" {...p} />,
                hr: () => <hr className="my-8 border-navy/10" />,
              }}
            >{article.body}</ReactMarkdown>
          </div>

          <div className="mt-16 grid gap-4 border-t border-navy/10 pt-8 sm:grid-cols-2">
            {prev ? (
              <Link
                to="/docs/$slug"
                params={{ slug: prev.slug }}
                className="group grid gap-1 rounded-xl border border-navy/10 p-4 transition-colors hover:border-teal"
              >
                <span className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-widest text-navy/50">
                  <ArrowLeft className="size-3" /> Previous
                </span>
                <span className="font-serif text-navy">{prev.title}</span>
              </Link>
            ) : <span />}
            {next ? (
              <Link
                to="/docs/$slug"
                params={{ slug: next.slug }}
                className="group grid gap-1 rounded-xl border border-navy/10 p-4 text-right transition-colors hover:border-teal"
              >
                <span className="inline-flex items-center justify-end gap-1 font-mono text-[11px] uppercase tracking-widest text-navy/50">
                  Next <ArrowRight className="size-3" />
                </span>
                <span className="font-serif text-navy">{next.title}</span>
              </Link>
            ) : <span />}
          </div>
        </article>
      </div>
    </section>
  );
}
