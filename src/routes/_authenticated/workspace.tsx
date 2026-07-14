import { createFileRoute } from "@tanstack/react-router";
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
    <div className="mx-auto max-w-6xl px-6 py-16">
      <p className="font-mono text-[11px] uppercase tracking-widest text-teal">Workspace · v0</p>
      <h1 className="mt-2 font-serif text-4xl text-navy">
        Welcome{user?.name ? `, ${user.name}` : ""}.
      </h1>
      <p className="mt-3 max-w-xl text-navy/70">
        Your optimizer, scenarios, and saved runs will appear here. We're porting them in from the
        launchpad backend in the next phase.
      </p>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {[
          { t: "Optimizer", d: "Compute optimal cross-border routes across 131 jurisdictions." },
          { t: "Scenarios", d: "Save, replay, and share tax scenarios with proofs." },
          { t: "Assistant", d: "Ask about your run — every claim linked to the math." },
        ].map((c) => (
          <div
            key={c.t}
            className="rounded-sm border border-navy/10 bg-white p-6 shadow-[0_1px_2px_rgba(5,35,71,0.04)]"
          >
            <p className="font-serif text-xl text-navy">{c.t}</p>
            <p className="mt-2 text-sm text-navy/60">{c.d}</p>
            <p className="mt-4 text-[10px] font-mono uppercase tracking-widest text-navy/40">
              Coming soon
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
