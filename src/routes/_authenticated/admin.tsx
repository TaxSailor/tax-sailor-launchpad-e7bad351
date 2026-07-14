import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import {
  getAdminMetrics,
  listLeads,
  listUsers,
  updateLeadStatus,
  setUserRole,
  type AdminMetrics,
  type LeadRow,
  type UserRow,
} from "@/lib/admin";
import { getAuthToken } from "@/lib/auth/session";
import { Loader2, ShieldCheck, Users, Inbox, Activity, EuroIcon } from "lucide-react";

type TabId = "overview" | "leads" | "users";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "leads", label: "Leads" },
  { id: "users", label: "Users" },
];

function readRole(): "user" | "admin" | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("taxsailor.session.v1");
    if (!raw) return null;
    const s = JSON.parse(raw) as { user?: { role?: "user" | "admin" } };
    return s.user?.role ?? null;
  } catch {
    return null;
  }
}

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — TaxSailor" },
      { name: "robots", content: "noindex" },
    ],
  }),
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (!getAuthToken()) return;
    if (readRole() !== "admin") throw redirect({ to: "/workspace" });
  },
  component: AdminPage,
});

function AdminPage() {
  const [tab, setTab] = useState<TabId>("overview");

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-white">
        <section className="border-b border-navy/10 bg-navy text-white">
          <div className="mx-auto max-w-6xl px-6 py-10 md:py-14">
            <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em] text-teal">
              <ShieldCheck className="size-3.5" /> Internal · Admin
            </p>
            <h1 className="mt-2 font-serif text-3xl md:text-4xl">Operations console</h1>
            <p className="mt-3 max-w-2xl text-sm text-white/70">
              Leads, users, and platform metrics. Wired to <code className="font-mono text-teal">/api/admin/*</code> —
              serves fixtures until the FastAPI backend is reachable.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`rounded-sm border px-4 py-2 text-sm font-medium transition-colors ${
                    tab === t.id
                      ? "border-teal bg-teal text-navy"
                      : "border-white/20 text-white/80 hover:border-teal hover:text-teal"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-10 md:py-14">
          {tab === "overview" && <OverviewTab />}
          {tab === "leads" && <LeadsTab />}
          {tab === "users" && <UsersTab />}
          <div className="mt-10 border-t border-navy/10 pt-6 text-xs text-navy/60">
            <Link to="/workspace" className="underline hover:text-teal">
              ← Back to workspace
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Loading() {
  return (
    <div className="flex items-center gap-2 text-sm text-navy/60">
      <Loader2 className="size-4 animate-spin" /> Loading…
    </div>
  );
}

function OverviewTab() {
  const [m, setM] = useState<AdminMetrics | null>(null);
  useEffect(() => {
    getAdminMetrics().then(setM).catch(() => setM(null));
  }, []);
  if (!m) return <Loading />;
  const cards = [
    { icon: Users, label: "Users total", value: m.users_total.toLocaleString(), delta: `+${m.users_new_7d} · 7d` },
    { icon: Inbox, label: "Leads total", value: m.leads_total.toLocaleString(), delta: `+${m.leads_new_7d} · 7d` },
    { icon: Activity, label: "Simulations", value: m.simulations_total.toLocaleString(), delta: `+${m.simulations_7d} · 7d` },
    { icon: EuroIcon, label: "MRR", value: `€${m.mrr_eur.toLocaleString()}`, delta: `${m.paying_customers} paying` },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="rounded-md border border-navy/10 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-navy/60">{c.label}</p>
            <c.icon className="size-4 text-teal" />
          </div>
          <p className="mt-3 font-serif text-3xl text-navy">{c.value}</p>
          <p className="mt-1 font-mono text-[11px] text-navy/60">{c.delta}</p>
        </div>
      ))}
    </div>
  );
}

function LeadsTab() {
  const [rows, setRows] = useState<LeadRow[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  useEffect(() => {
    listLeads().then((r) => setRows(r.items)).catch(() => setRows([]));
  }, []);
  if (!rows) return <Loading />;

  async function update(id: string, status: LeadRow["status"]) {
    setBusy(id);
    try {
      await updateLeadStatus(id, status);
      setRows((r) => r?.map((x) => (x.id === id ? { ...x, status } : x)) ?? null);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="overflow-hidden rounded-md border border-navy/10">
      <table className="w-full text-sm">
        <thead className="bg-ghost text-left text-xs uppercase tracking-wider text-navy/60">
          <tr>
            <th className="px-4 py-3 font-mono">ID</th>
            <th className="px-4 py-3 font-mono">Contact</th>
            <th className="px-4 py-3 font-mono">Audience</th>
            <th className="px-4 py-3 font-mono">Message</th>
            <th className="px-4 py-3 font-mono">Received</th>
            <th className="px-4 py-3 font-mono">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-navy/10 bg-white">
          {rows.map((l) => (
            <tr key={l.id}>
              <td className="px-4 py-3 font-mono text-xs text-navy/60">{l.id}</td>
              <td className="px-4 py-3">
                <div className="font-medium text-navy">{l.name ?? "—"}</div>
                <a href={`mailto:${l.email}`} className="text-xs text-teal hover:underline">
                  {l.email}
                </a>
              </td>
              <td className="px-4 py-3 capitalize text-navy/80">{l.audience}</td>
              <td className="max-w-[260px] truncate px-4 py-3 text-navy/70">{l.message ?? "—"}</td>
              <td className="px-4 py-3 font-mono text-xs text-navy/60">
                {new Date(l.created_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <select
                  value={l.status}
                  disabled={busy === l.id}
                  onChange={(e) => update(l.id, e.target.value as LeadRow["status"])}
                  className="rounded-sm border border-navy/15 bg-white px-2 py-1 text-xs text-navy"
                >
                  <option value="new">new</option>
                  <option value="contacted">contacted</option>
                  <option value="qualified">qualified</option>
                  <option value="closed">closed</option>
                </select>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-sm text-navy/60">
                No leads yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function UsersTab() {
  const [rows, setRows] = useState<UserRow[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  useEffect(() => {
    listUsers().then((r) => setRows(r.items)).catch(() => setRows([]));
  }, []);
  if (!rows) return <Loading />;

  async function toggle(u: UserRow) {
    const next = u.role === "admin" ? "user" : "admin";
    setBusy(u.id);
    try {
      await setUserRole(u.id, next);
      setRows((r) => r?.map((x) => (x.id === u.id ? { ...x, role: next } : x)) ?? null);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="overflow-hidden rounded-md border border-navy/10">
      <table className="w-full text-sm">
        <thead className="bg-ghost text-left text-xs uppercase tracking-wider text-navy/60">
          <tr>
            <th className="px-4 py-3 font-mono">User</th>
            <th className="px-4 py-3 font-mono">Tier</th>
            <th className="px-4 py-3 font-mono">Joined</th>
            <th className="px-4 py-3 font-mono">Last seen</th>
            <th className="px-4 py-3 font-mono">Role</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-navy/10 bg-white">
          {rows.map((u) => (
            <tr key={u.id}>
              <td className="px-4 py-3">
                <div className="font-medium text-navy">{u.display_name ?? u.email}</div>
                <div className="text-xs text-navy/60">{u.email}</div>
              </td>
              <td className="px-4 py-3 capitalize text-navy/80">{u.tier}</td>
              <td className="px-4 py-3 font-mono text-xs text-navy/60">
                {new Date(u.created_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 font-mono text-xs text-navy/60">
                {u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : "—"}
              </td>
              <td className="px-4 py-3">
                <button
                  disabled={busy === u.id}
                  onClick={() => toggle(u)}
                  className={`rounded-sm border px-3 py-1 text-xs font-medium transition-colors ${
                    u.role === "admin"
                      ? "border-teal bg-teal/10 text-teal hover:bg-teal/20"
                      : "border-navy/15 text-navy hover:border-teal hover:text-teal"
                  }`}
                >
                  {u.role}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
