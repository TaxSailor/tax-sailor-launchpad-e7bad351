import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import {
  getProfile,
  updateProfile,
  getSubscription,
  listRuns,
  deleteRun,
  changePassword,
  type AccountProfile,
  type AccountSubscription,
  type SavedRunSummary,
} from "@/lib/workspace/account";
import { logout } from "@/lib/auth/session";
import { buildPricingMailtoHref } from "@/lib/pricing";

type TabId = "profile" | "subscription" | "runs" | "security";

const TABS: { id: TabId; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "subscription", label: "Subscription" },
  { id: "runs", label: "Saved runs" },
  { id: "security", label: "Security" },
];

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "Account — TaxSailor" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const [tab, setTab] = useState<TabId>("profile");

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-white">
        <section className="border-b border-navy/10 bg-ghost">
          <div className="mx-auto max-w-6xl px-6 py-10 md:py-14">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-teal">Account</p>
            <h1 className="mt-2 font-serif text-3xl text-navy md:text-4xl">
              Your TaxSailor workspace
            </h1>
            <div className="mt-6 flex flex-wrap gap-2">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`rounded-sm border px-4 py-2 text-sm font-medium transition-colors ${
                    tab === t.id
                      ? "border-navy bg-navy text-white"
                      : "border-navy/15 bg-white text-navy hover:border-teal hover:text-teal"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-6xl px-6 py-10 md:py-14">
          {tab === "profile" && <ProfileTab />}
          {tab === "subscription" && <SubscriptionTab />}
          {tab === "runs" && <RunsTab />}
          {tab === "security" && <SecurityTab />}
        </section>
      </main>
      <Footer />
    </>
  );
}

// ---------- Profile ----------

function ProfileTab() {
  const [p, setP] = useState<AccountProfile | null>(null);
  const [name, setName] = useState("");
  const [locale, setLocale] = useState("en");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    getProfile()
      .then((v) => {
        setP(v);
        setName(v.display_name ?? "");
        setLocale(v.locale);
      })
      .catch((e) => setErr(e instanceof Error ? e.message : String(e)));
  }, []);

  if (err) return <ErrorBlock message={err} />;
  if (!p) return <SkeletonBlock />;

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    setErr(null);
    try {
      const next = await updateProfile({ display_name: name, locale });
      setP(next);
      setMsg("Profile updated.");
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : String(e2));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-[1.4fr_1fr]">
      <form onSubmit={onSave} className="rounded-sm border border-navy/15 bg-white p-6">
        <h2 className="font-serif text-xl text-navy">Profile</h2>
        <p className="mt-1 text-sm text-navy/60">Displayed on reports and shared runs.</p>
        <div className="mt-6 grid gap-4">
          <Field label="Email">
            <input
              value={p.email}
              readOnly
              className="w-full rounded-sm border border-navy/10 bg-ghost px-3 py-2 text-sm text-navy/60"
            />
          </Field>
          <Field label="Display name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-sm border border-navy/20 bg-white px-3 py-2 text-sm text-navy focus:border-teal focus:outline-none"
            />
          </Field>
          <Field label="Locale">
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              className="w-full rounded-sm border border-navy/20 bg-white px-3 py-2 text-sm text-navy focus:border-teal focus:outline-none"
            >
              <option value="en">English</option>
              <option value="de">Deutsch</option>
            </select>
          </Field>
        </div>
        {msg && <p className="mt-4 text-sm text-teal">{msg}</p>}
        {err && <p className="mt-4 text-sm text-red-600">{err}</p>}
        <button
          type="submit"
          disabled={saving}
          className="mt-6 inline-flex rounded-sm bg-navy px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
      <aside className="rounded-sm border border-navy/15 bg-ghost p-6">
        <p className="font-mono text-[11px] uppercase tracking-widest text-navy/50">Member since</p>
        <p className="mt-2 font-serif text-2xl text-navy">
          {new Date(p.created_at).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
          })}
        </p>
        <p className="mt-6 font-mono text-[11px] uppercase tracking-widest text-navy/50">
          Account ID
        </p>
        <p className="mt-2 break-all font-mono text-xs text-navy/70">{p.id}</p>
      </aside>
    </div>
  );
}

// ---------- Subscription ----------

function SubscriptionTab() {
  const [sub, setSub] = useState<AccountSubscription | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    getSubscription()
      .then(setSub)
      .catch((e) => setErr(e instanceof Error ? e.message : String(e)));
  }, []);

  if (err) return <ErrorBlock message={err} />;
  if (!sub) return <SkeletonBlock />;

  const usage =
    sub.simulations_included && sub.simulations_included > 0
      ? Math.min(1, sub.simulations_used / sub.simulations_included)
      : 0;

  return (
    <div className="grid gap-6 md:grid-cols-[1.3fr_1fr]">
      <div className="rounded-sm border border-navy/15 bg-white p-6">
        <p className="font-mono text-[11px] uppercase tracking-widest text-navy/50">
          Current plan
        </p>
        <div className="mt-2 flex flex-wrap items-baseline gap-3">
          <h2 className="font-serif text-3xl text-navy">{sub.tier_label}</h2>
          <span
            className={`rounded-sm px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${
              sub.status === "active"
                ? "bg-teal/15 text-teal"
                : "bg-navy/10 text-navy/60"
            }`}
          >
            {sub.status}
          </span>
        </div>
        {sub.renews_at && (
          <p className="mt-2 text-sm text-navy/60">
            Renews {new Date(sub.renews_at).toLocaleDateString()}
          </p>
        )}
        {sub.simulations_included !== null && (
          <div className="mt-6">
            <div className="flex items-baseline justify-between font-mono text-[11px] uppercase tracking-widest text-navy/50">
              <span>Simulations used</span>
              <span>
                {sub.simulations_used} / {sub.simulations_included}
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-navy/10">
              <div
                className="h-full bg-teal transition-all"
                style={{ width: `${usage * 100}%` }}
              />
            </div>
          </div>
        )}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/pricing"
            className="inline-flex rounded-sm bg-navy px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal"
          >
            View plans
          </Link>
          <a
            href={buildPricingMailtoHref()}
            className="inline-flex rounded-sm border border-navy/20 px-5 py-2.5 text-sm font-medium text-navy transition-colors hover:border-teal hover:text-teal"
          >
            Contact sales
          </a>
        </div>
      </div>
      <aside className="rounded-sm border border-navy/15 bg-ghost p-6">
        <p className="font-mono text-[11px] uppercase tracking-widest text-navy/50">
          What's next
        </p>
        <p className="mt-3 text-sm text-navy/80">
          Billing is contact-to-pay while we finalise the payment stack. Upgrades unlock unlimited
          runs, PDF exports without watermark, and advisor-grade evidence tables.
        </p>
      </aside>
    </div>
  );
}

// ---------- Runs ----------

function RunsTab() {
  const [runs, setRuns] = useState<SavedRunSummary[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    listRuns()
      .then((r) => setRuns(r.runs))
      .catch((e) => setErr(e instanceof Error ? e.message : String(e)));
  }, []);

  if (err) return <ErrorBlock message={err} />;
  if (!runs) return <SkeletonBlock />;

  const onDelete = async (id: string) => {
    if (!confirm("Delete this run? It won't be recoverable.")) return;
    try {
      await deleteRun(id);
      setRuns((cur) => cur?.filter((r) => r.id !== id) ?? null);
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    }
  };

  if (runs.length === 0) {
    return (
      <div className="rounded-sm border border-dashed border-navy/20 bg-ghost p-10 text-center">
        <p className="font-mono text-[11px] uppercase tracking-widest text-navy/50">Empty</p>
        <h3 className="mt-2 font-serif text-2xl text-navy">No saved runs yet</h3>
        <p className="mt-2 text-sm text-navy/60">
          Run a scenario in the workspace and it'll appear here.
        </p>
        <Link
          to="/workspace"
          className="mt-5 inline-flex rounded-sm bg-navy px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal"
        >
          Open workspace
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-sm border border-navy/15 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-ghost font-mono text-[11px] uppercase tracking-widest text-navy/50">
          <tr>
            <th className="px-4 py-3">Scenario</th>
            <th className="px-4 py-3">Route</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Effective τ</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {runs.map((r) => (
            <tr key={r.id} className="border-t border-navy/10 text-navy">
              <td className="px-4 py-3 font-medium">{r.scenario_label}</td>
              <td className="px-4 py-3 font-mono text-xs">
                {r.origin} → {r.destination}
              </td>
              <td className="px-4 py-3">
                €{r.amount_eur.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </td>
              <td className="px-4 py-3">{(r.effective_tax_pct * 100).toFixed(2)}%</td>
              <td className="px-4 py-3 text-navy/60">
                {new Date(r.created_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  to="/workspace/results/$runId"
                  params={{ runId: r.id }}
                  className="mr-3 font-mono text-xs text-teal hover:underline"
                >
                  Open →
                </Link>
                <button
                  onClick={() => onDelete(r.id)}
                  className="font-mono text-xs text-navy/50 hover:text-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------- Security ----------

function SecurityTab() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    if (next.length < 8) {
      setErr("New password must be at least 8 characters.");
      return;
    }
    if (next !== confirmPw) {
      setErr("Passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      await changePassword(current, next);
      setMsg("Password updated.");
      setCurrent("");
      setNext("");
      setConfirmPw("");
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : String(e2));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-[1.3fr_1fr]">
      <form onSubmit={onSubmit} className="rounded-sm border border-navy/15 bg-white p-6">
        <h2 className="font-serif text-xl text-navy">Change password</h2>
        <p className="mt-1 text-sm text-navy/60">
          You'll stay signed in on this device after the change.
        </p>
        <div className="mt-6 grid gap-4">
          <Field label="Current password">
            <input
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className="w-full rounded-sm border border-navy/20 bg-white px-3 py-2 text-sm text-navy focus:border-teal focus:outline-none"
              required
            />
          </Field>
          <Field label="New password">
            <input
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              className="w-full rounded-sm border border-navy/20 bg-white px-3 py-2 text-sm text-navy focus:border-teal focus:outline-none"
              required
              minLength={8}
            />
          </Field>
          <Field label="Confirm new password">
            <input
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              className="w-full rounded-sm border border-navy/20 bg-white px-3 py-2 text-sm text-navy focus:border-teal focus:outline-none"
              required
              minLength={8}
            />
          </Field>
        </div>
        {msg && <p className="mt-4 text-sm text-teal">{msg}</p>}
        {err && <p className="mt-4 text-sm text-red-600">{err}</p>}
        <button
          type="submit"
          disabled={busy}
          className="mt-6 inline-flex rounded-sm bg-navy px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal disabled:opacity-60"
        >
          {busy ? "Updating…" : "Update password"}
        </button>
      </form>
      <aside className="rounded-sm border border-navy/15 bg-ghost p-6">
        <p className="font-mono text-[11px] uppercase tracking-widest text-navy/50">Sessions</p>
        <p className="mt-3 text-sm text-navy/80">
          Signing out clears your access token on this device. Refresh tokens issued elsewhere stay
          valid until they expire.
        </p>
        <button
          onClick={async () => {
            await logout();
            window.location.href = "/";
          }}
          className="mt-5 inline-flex w-full items-center justify-center rounded-sm border border-navy/20 px-4 py-2.5 text-sm font-medium text-navy transition-colors hover:border-red-500 hover:text-red-600"
        >
          Sign out of this device
        </button>
      </aside>
    </div>
  );
}

// ---------- Shared ----------

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="font-mono text-[11px] uppercase tracking-widest text-navy/50">{label}</span>
      {children}
    </label>
  );
}

function SkeletonBlock() {
  return (
    <div className="animate-pulse rounded-sm border border-navy/10 bg-white p-6">
      <div className="h-5 w-40 bg-navy/10" />
      <div className="mt-4 h-4 w-64 bg-navy/5" />
      <div className="mt-6 h-24 bg-navy/5" />
    </div>
  );
}

function ErrorBlock({ message }: { message: string }) {
  return (
    <div className="rounded-sm border border-red-200 bg-red-50 p-6">
      <p className="font-mono text-[11px] uppercase tracking-widest text-red-600">Error</p>
      <p className="mt-2 text-sm text-navy">{message}</p>
    </div>
  );
}
