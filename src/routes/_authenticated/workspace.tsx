import { createFileRoute, Link } from "@tanstack/react-router";
import { SCENARIOS } from "@/lib/workspace/scenarios";
import { useSession } from "@/lib/auth/session";

export const Route = createFileRoute("/_authenticated/workspace")({
  head: () => ({
    meta: [
      { title: "Workspace — TaxSailor" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WorkspacePage,
});

function WorkspacePage() {
  const { user } = useSession();
  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-teal">
            Workspace · Scenario picker
          </p>
          <h1 className="mt-2 font-serif text-3xl text-navy md:text-4xl">
            What are you optimising{user?.name ? `, ${user.name.split(" ")[0]}` : ""}?
          </h1>
          <p className="mt-2 max-w-xl text-sm text-navy/70">
            Pick a scenario. We route it across 131 jurisdictions and return an evidenced,
            comparable optimum.
          </p>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-navy/50">
          6 scenarios · v1
        </div>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SCENARIOS.map((s) => (
          <Link
            key={s.id}
            to="/workspace/scenario/$scenarioId"
            params={{ scenarioId: s.id }}
            className="group block rounded-sm border border-navy/10 bg-white p-6 transition hover:border-teal hover:shadow-[0_4px_20px_rgba(5,35,71,0.08)]"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-teal">
                {s.audience}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-navy/40 group-hover:text-navy">
                Configure →
              </span>
            </div>
            <p className="mt-3 font-serif text-xl text-navy">{s.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-navy/60">{s.summary}</p>
            <p className="mt-4 border-t border-navy/5 pt-3 font-mono text-[11px] text-navy/50">
              {s.math}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
