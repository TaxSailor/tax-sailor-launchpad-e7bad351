import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  removeAvatar,
  changeEmail,
  changePassword,
  setPassword,
  resendVerificationEmail,
  getSubscription,
  getSettings,
  updateSettings,
  listRuns,
  updateRun,
  deleteRun,
  exportAccountData,
  deleteAccount,
  getOAuthProviders,
  type AccountProfile,
  type AccountSubscription,
  type AccountSettings,
  type SavedRunSummary,
  type OAuthProviders,
} from "@/lib/workspace/account";
import { logout, signInWithOAuth } from "@/lib/auth/session";
import { buildPricingMailtoHref } from "@/lib/pricing";

type TabId = "profile" | "subscription" | "runs" | "preferences" | "security";

const TABS: { id: TabId; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "subscription", label: "Subscription" },
  { id: "runs", label: "Saved runs" },
  { id: "preferences", label: "Preferences" },
  { id: "security", label: "Security" },
];

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "Account — TaxSailor" },
      { name: "description", content: "Manage your TaxSailor profile, plan, saved runs and security." },
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
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-14">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-teal">Account</p>
            <h1 className="mt-2 font-serif text-3xl text-navy md:text-4xl">
              Your TaxSailor workspace
            </h1>
            <div
              role="tablist"
              aria-label="Account sections"
              className="mt-6 flex flex-wrap gap-2"
            >
              {TABS.map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => setTab(t.id)}
                  className={`min-h-11 rounded-sm border px-4 py-2 text-sm font-medium transition-colors ${
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
        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-14">
          {tab === "profile" && <ProfileTab />}
          {tab === "subscription" && <SubscriptionTab />}
          {tab === "runs" && <RunsTab />}
          {tab === "preferences" && <PreferencesTab />}
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
  const [marketing, setMarketing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function hydrate(v: AccountProfile) {
    setP(v);
    setName(v.display_name ?? "");
    setLocale(v.locale || "en");
    setMarketing(v.marketing_opt_in);
  }

  useEffect(() => {
    getProfile()
      .then(hydrate)
      .catch((e) => setErr(e instanceof Error ? e.message : String(e)));
  }, []);

  if (err && !p) return <ErrorBlock message={err} />;
  if (!p) return <SkeletonBlock />;

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    setErr(null);
    try {
      hydrate(
        await updateProfile({
          display_name: name.trim() || null,
          locale,
          marketing_opt_in: marketing,
        }),
      );
      setMsg("Profile saved.");
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : String(e2));
    } finally {
      setSaving(false);
    }
  };

  const onPickFile = async (file: File | undefined) => {
    if (!file) return;
    setAvatarBusy(true);
    setMsg(null);
    setErr(null);
    try {
      hydrate(await uploadAvatar(file));
      setMsg("Avatar updated.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setAvatarBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onRemoveAvatar = async () => {
    setAvatarBusy(true);
    setErr(null);
    try {
      hydrate(await removeAvatar());
      setMsg("Avatar removed.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setAvatarBusy(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <form onSubmit={onSave} className="rounded-sm border border-navy/15 bg-white p-5 sm:p-6">
        <h2 className="font-serif text-xl text-navy">Profile</h2>
        <p className="mt-1 text-sm text-navy/60">Shown on reports and shared runs.</p>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Avatar url={p.avatar_url} email={p.email} name={p.display_name} />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={avatarBusy}
              className="min-h-11 rounded-sm border border-navy/20 px-4 text-sm font-medium text-navy transition-colors hover:border-teal hover:text-teal disabled:opacity-60"
            >
              {avatarBusy ? "Working" : "Upload photo"}
            </button>
            {(p.avatar_uploaded || p.avatar_url) && (
              <button
                type="button"
                onClick={onRemoveAvatar}
                disabled={avatarBusy}
                className="min-h-11 rounded-sm border border-navy/15 px-4 text-sm text-navy/70 transition-colors hover:border-red-400 hover:text-red-600 disabled:opacity-60"
              >
                Remove
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(e) => onPickFile(e.target.files?.[0])}
            />
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          <Field label="Email">
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={p.email}
                readOnly
                className="min-h-11 flex-1 rounded-sm border border-navy/10 bg-ghost px-3 text-sm text-navy/60"
              />
              <span
                className={`rounded-sm px-2 py-1 font-mono text-[10px] uppercase tracking-widest ${
                  p.email_verified ? "bg-teal/15 text-teal" : "bg-amber-100 text-amber-700"
                }`}
              >
                {p.email_verified ? "Verified" : "Unverified"}
              </span>
            </div>
          </Field>
          <Field label="Display name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="min-h-11 w-full rounded-sm border border-navy/20 bg-white px-3 text-sm text-navy focus:border-teal focus:outline-none"
            />
          </Field>
          <Field label="Language">
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              className="min-h-11 w-full rounded-sm border border-navy/20 bg-white px-3 text-sm text-navy focus:border-teal focus:outline-none"
            >
              <option value="en">English</option>
              <option value="de">Deutsch</option>
            </select>
          </Field>
          <label className="flex items-start gap-3 text-sm text-navy">
            <input
              type="checkbox"
              checked={marketing}
              onChange={(e) => setMarketing(e.target.checked)}
              className="mt-1 size-4 accent-[#14b8a6]"
            />
            <span>Send me product and research updates by email.</span>
          </label>
        </div>

        {msg && <p className="mt-4 text-sm text-teal">{msg}</p>}
        {err && <p className="mt-4 text-sm text-red-600">{err}</p>}
        <button
          type="submit"
          disabled={saving}
          className="mt-6 inline-flex min-h-11 items-center rounded-sm bg-navy px-5 text-sm font-medium text-white transition-colors hover:bg-teal disabled:opacity-60"
        >
          {saving ? "Saving" : "Save changes"}
        </button>
      </form>

      <div className="grid content-start gap-4">
        {!p.email_verified && <VerifyEmailCard />}
        <ChangeEmailCard profile={p} onChanged={hydrate} />
        <aside className="rounded-sm border border-navy/15 bg-ghost p-5 sm:p-6">
          <p className="font-mono text-[11px] uppercase tracking-widest text-navy/50">Account ID</p>
          <p className="mt-2 break-all font-mono text-xs text-navy/70">{p.id}</p>
          <p className="mt-5 font-mono text-[11px] uppercase tracking-widest text-navy/50">
            Sign-in method
          </p>
          <p className="mt-2 text-sm text-navy/80">
            {p.oauth_provider
              ? `Connected through ${p.oauth_provider}`
              : p.has_password
                ? "Email and password"
                : "Magic link"}
          </p>
        </aside>
      </div>
    </div>
  );
}

function Avatar({
  url,
  email,
  name,
}: {
  url: string | null;
  email: string;
  name: string | null;
}) {
  const initials = (name ?? email).trim().slice(0, 2).toUpperCase();
  if (url) {
    return (
      <img
        src={url}
        alt="Your profile photo"
        className="size-16 rounded-full border border-navy/15 object-cover"
      />
    );
  }
  return (
    <div className="flex size-16 items-center justify-center rounded-full border border-navy/15 bg-ghost font-serif text-xl text-navy">
      {initials}
    </div>
  );
}

function VerifyEmailCard() {
  const [state, setState] = useState<"idle" | "busy" | "sent">("idle");
  const [err, setErr] = useState<string | null>(null);
  return (
    <div className="rounded-sm border border-amber-200 bg-amber-50 p-5">
      <p className="font-mono text-[11px] uppercase tracking-widest text-amber-700">
        Email not verified
      </p>
      <p className="mt-2 text-sm text-navy/80">
        Verify your address to keep access to saved runs and exports.
      </p>
      {state === "sent" ? (
        <p className="mt-3 text-sm text-teal">Verification email sent.</p>
      ) : (
        <button
          onClick={async () => {
            setState("busy");
            setErr(null);
            try {
              await resendVerificationEmail();
              setState("sent");
            } catch (e) {
              setErr(e instanceof Error ? e.message : String(e));
              setState("idle");
            }
          }}
          disabled={state === "busy"}
          className="mt-4 inline-flex min-h-11 items-center rounded-sm border border-navy/20 bg-white px-4 text-sm font-medium text-navy hover:border-teal hover:text-teal disabled:opacity-60"
        >
          {state === "busy" ? "Sending" : "Send verification email"}
        </button>
      )}
      {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
    </div>
  );
}

function ChangeEmailCard({
  profile,
  onChanged,
}: {
  profile: AccountProfile;
  onChanged: (p: AccountProfile) => void;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="rounded-sm border border-navy/15 bg-white p-5 sm:p-6">
      <h3 className="font-serif text-lg text-navy">Change email</h3>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="mt-3 inline-flex min-h-11 items-center rounded-sm border border-navy/20 px-4 text-sm font-medium text-navy hover:border-teal hover:text-teal"
        >
          Use a different address
        </button>
      ) : (
        <form
          className="mt-4 grid gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setErr(null);
            setMsg(null);
            try {
              const r = await changeEmail(email, profile.has_password ? pw : undefined);
              onChanged(r.profile);
              setMsg(r.message);
              setOpen(false);
              setEmail("");
              setPw("");
            } catch (e2) {
              setErr(e2 instanceof Error ? e2.message : String(e2));
            } finally {
              setBusy(false);
            }
          }}
        >
          <Field label="New email">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-h-11 w-full rounded-sm border border-navy/20 px-3 text-sm text-navy focus:border-teal focus:outline-none"
            />
          </Field>
          {profile.has_password && (
            <Field label="Current password">
              <input
                type="password"
                required
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                className="min-h-11 w-full rounded-sm border border-navy/20 px-3 text-sm text-navy focus:border-teal focus:outline-none"
              />
            </Field>
          )}
          {err && <p className="text-sm text-red-600">{err}</p>}
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex min-h-11 items-center rounded-sm bg-navy px-4 text-sm font-medium text-white hover:bg-teal disabled:opacity-60"
            >
              {busy ? "Updating" : "Update email"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex min-h-11 items-center rounded-sm border border-navy/20 px-4 text-sm text-navy"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      {msg && <p className="mt-3 text-sm text-teal">{msg}</p>}
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

  const allowance = sub.simulation_credits_allowance ?? null;
  const remaining = sub.simulation_credits_remaining ?? null;
  const used = allowance !== null && remaining !== null ? Math.max(0, allowance - remaining) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div className="rounded-sm border border-navy/15 bg-white p-5 sm:p-6">
        <p className="font-mono text-[11px] uppercase tracking-widest text-navy/50">Current plan</p>
        <div className="mt-2 flex flex-wrap items-baseline gap-3">
          <h2 className="font-serif text-3xl text-navy">{sub.plan_label}</h2>
          <span
            className={`rounded-sm px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${
              sub.status === "active" ? "bg-teal/15 text-teal" : "bg-navy/10 text-navy/60"
            }`}
          >
            {sub.status_label || sub.status}
          </span>
        </div>
        <p className="mt-2 font-mono text-xs text-navy/60">
          Entitlement tier: {sub.entitlement_tier}
        </p>
        {sub.current_period_end && (
          <p className="mt-1 text-sm text-navy/60">
            Runs until {new Date(sub.current_period_end).toLocaleDateString("en-GB")}
          </p>
        )}
        {allowance !== null && used !== null && (
          <div className="mt-6">
            <div className="flex items-baseline justify-between font-mono text-[11px] uppercase tracking-widest text-navy/50">
              <span>Simulations used</span>
              <span>
                {used} / {allowance}
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-navy/10">
              <div
                className="h-full bg-teal transition-all"
                style={{ width: `${allowance > 0 ? Math.min(100, (used / allowance) * 100) : 0}%` }}
              />
            </div>
          </div>
        )}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/pricing"
            className="inline-flex min-h-11 items-center rounded-sm bg-navy px-5 text-sm font-medium text-white transition-colors hover:bg-teal"
          >
            View plans
          </Link>
          <a
            href={buildPricingMailtoHref()}
            className="inline-flex min-h-11 items-center rounded-sm border border-navy/20 px-5 text-sm font-medium text-navy transition-colors hover:border-teal hover:text-teal"
          >
            Contact sales
          </a>
        </div>
      </div>
      <aside className="rounded-sm border border-navy/15 bg-ghost p-5 sm:p-6">
        <p className="font-mono text-[11px] uppercase tracking-widest text-navy/50">Upgrading</p>
        <p className="mt-3 text-sm text-navy/80">{sub.upgrade_message}</p>
        {sub.billing_email && (
          <p className="mt-4 font-mono text-xs text-navy/60">Billing email: {sub.billing_email}</p>
        )}
      </aside>
    </div>
  );
}

// ---------- Saved runs ----------

function RunsTab() {
  const [runs, setRuns] = useState<SavedRunSummary[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);

  useEffect(() => {
    listRuns()
      .then((r) => setRuns(r.runs))
      .catch((e) => setErr(e instanceof Error ? e.message : String(e)));
  }, []);

  if (err) return <ErrorBlock message={err} />;
  if (!runs) return <SkeletonBlock />;

  const onDelete = async (id: string) => {
    if (!window.confirm("Delete this saved run? This cannot be undone.")) return;
    try {
      await deleteRun(id);
      setRuns((cur) => cur?.filter((r) => r.id !== id) ?? null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  const onSaved = (updated: SavedRunSummary) => {
    setRuns((cur) => cur?.map((r) => (r.id === updated.id ? updated : r)) ?? null);
    setEditing(null);
  };

  if (runs.length === 0) {
    return (
      <div className="rounded-sm border border-dashed border-navy/20 bg-ghost p-8 text-center sm:p-10">
        <p className="font-mono text-[11px] uppercase tracking-widest text-navy/50">Empty</p>
        <h3 className="mt-2 font-serif text-2xl text-navy">No saved runs yet</h3>
        <p className="mt-2 text-sm text-navy/60">
          Run a scenario in the workspace and it appears here.
        </p>
        <Link
          to="/workspace"
          className="mt-5 inline-flex min-h-11 items-center rounded-sm bg-navy px-5 text-sm font-medium text-white transition-colors hover:bg-teal"
        >
          Open workspace
        </Link>
      </div>
    );
  }

  return (
    <ul className="grid gap-3">
      {runs.map((r) => (
        <li key={r.id} className="rounded-sm border border-navy/15 bg-white p-4 sm:p-5">
          {editing === r.id ? (
            <RunEditor run={r} onCancel={() => setEditing(null)} onSaved={onSaved} />
          ) : (
            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
              <div className="min-w-0">
                <p className="truncate font-medium text-navy">{r.scenario_label}</p>
                <p className="mt-1 font-mono text-xs text-navy/60">
                  {r.origin} to {r.destination} · {r.mode} ·{" "}
                  {new Date(r.created_at).toLocaleDateString("en-GB")}
                </p>
                {r.notes && <p className="mt-2 text-sm text-navy/70">{r.notes}</p>}
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                <span className="font-mono text-sm text-teal">
                  {r.retained_pct === null ? "Gated" : `${r.retained_pct.toFixed(1)}% retained`}
                </span>
                <Link
                  to="/workspace/results/$runId"
                  params={{ runId: r.id }}
                  className="inline-flex min-h-11 items-center rounded-sm border border-navy/20 px-3 text-sm text-navy hover:border-teal hover:text-teal"
                >
                  Open
                </Link>
                <button
                  onClick={() => setEditing(r.id)}
                  className="inline-flex min-h-11 items-center rounded-sm border border-navy/20 px-3 text-sm text-navy hover:border-teal hover:text-teal"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(r.id)}
                  className="inline-flex min-h-11 items-center rounded-sm border border-navy/15 px-3 text-sm text-navy/70 hover:border-red-400 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

function RunEditor({
  run,
  onCancel,
  onSaved,
}: {
  run: SavedRunSummary;
  onCancel: () => void;
  onSaved: (r: SavedRunSummary) => void;
}) {
  const [title, setTitle] = useState(run.title ?? "");
  const [notes, setNotes] = useState(run.notes ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  return (
    <form
      className="grid gap-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setErr(null);
        try {
          onSaved(
            await updateRun(run.id, {
              title: title.trim() || null,
              notes: notes.trim() || null,
            }),
          );
        } catch (e2) {
          setErr(e2 instanceof Error ? e2.message : String(e2));
        } finally {
          setBusy(false);
        }
      }}
    >
      <Field label="Run name">
        <input
          value={title}
          maxLength={200}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={`${run.origin} to ${run.destination}`}
          className="min-h-11 w-full rounded-sm border border-navy/20 px-3 text-sm text-navy focus:border-teal focus:outline-none"
        />
      </Field>
      <Field label="Notes">
        <textarea
          value={notes}
          maxLength={2000}
          rows={3}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-sm border border-navy/20 p-3 text-sm text-navy focus:border-teal focus:outline-none"
        />
      </Field>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex min-h-11 items-center rounded-sm bg-navy px-4 text-sm font-medium text-white hover:bg-teal disabled:opacity-60"
        >
          {busy ? "Saving" : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex min-h-11 items-center rounded-sm border border-navy/20 px-4 text-sm text-navy"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ---------- Preferences ----------

function PreferencesTab() {
  const [s, setS] = useState<AccountSettings | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    getSettings()
      .then(setS)
      .catch((e) => setErr(e instanceof Error ? e.message : String(e)));
  }, []);

  if (err && !s) return <ErrorBlock message={err} />;
  if (!s) return <SkeletonBlock />;

  const save = async (patch: Parameters<typeof updateSettings>[0]) => {
    setBusy(true);
    setMsg(null);
    setErr(null);
    try {
      setS(await updateSettings(patch));
      setMsg("Preferences saved.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div className="rounded-sm border border-navy/15 bg-white p-5 sm:p-6">
        <h2 className="font-serif text-xl text-navy">Preferences</h2>
        <p className="mt-1 text-sm text-navy/60">Applied across the workspace on every device.</p>

        <p className="mt-6 font-mono text-[11px] uppercase tracking-widest text-navy/50">Theme</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {["light", "dark", "system"].map((t) => (
            <button
              key={t}
              disabled={busy}
              onClick={() => save({ theme: t })}
              className={`min-h-11 rounded-sm border px-4 text-sm capitalize transition-colors ${
                s.theme === t
                  ? "border-navy bg-navy text-white"
                  : "border-navy/20 bg-white text-navy hover:border-teal hover:text-teal"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-3">
          <Toggle
            label="Email notifications"
            hint="Run completions, export links and account notices."
            checked={s.email_notifications}
            disabled={busy}
            onChange={(v) => save({ email_notifications: v })}
          />
          <Toggle
            label="Product updates"
            hint="New corridors, data releases and engine changes."
            checked={s.product_updates}
            disabled={busy}
            onChange={(v) => save({ product_updates: v })}
          />
        </div>

        {msg && <p className="mt-4 text-sm text-teal">{msg}</p>}
        {err && <p className="mt-4 text-sm text-red-600">{err}</p>}
      </div>
      <aside className="rounded-sm border border-navy/15 bg-ghost p-5 sm:p-6">
        <p className="font-mono text-[11px] uppercase tracking-widest text-navy/50">Last scenario</p>
        <p className="mt-2 text-sm text-navy/80">
          {s.last_scenario_key ?? "No scenario opened yet."}
        </p>
        <p className="mt-5 font-mono text-[11px] uppercase tracking-widest text-navy/50">Updated</p>
        <p className="mt-2 font-mono text-xs text-navy/60">
          {new Date(s.updated_at).toLocaleString("en-GB")}
        </p>
      </aside>
    </div>
  );
}

function Toggle({
  label,
  hint,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  disabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 rounded-sm border border-navy/10 p-3">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 size-4 accent-[#14b8a6]"
      />
      <span>
        <span className="block text-sm font-medium text-navy">{label}</span>
        <span className="mt-0.5 block text-sm text-navy/60">{hint}</span>
      </span>
    </label>
  );
}

// ---------- Security ----------

function SecurityTab() {
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [providers, setProviders] = useState<OAuthProviders | null>(null);

  useEffect(() => {
    getProfile().then(setProfile).catch(() => setProfile(null));
    getOAuthProviders().then(setProviders).catch(() => setProviders(null));
  }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div className="grid content-start gap-6">
        {profile && !profile.has_password ? (
          <SetPasswordCard onDone={() => getProfile().then(setProfile)} />
        ) : (
          <ChangePasswordCard />
        )}
        <DangerZone hasPassword={profile?.has_password ?? true} />
      </div>

      <div className="grid content-start gap-4">
        <aside className="rounded-sm border border-navy/15 bg-ghost p-5 sm:p-6">
          <p className="font-mono text-[11px] uppercase tracking-widest text-navy/50">
            Connected sign-in
          </p>
          <p className="mt-3 text-sm text-navy/80">
            {profile?.oauth_provider
              ? `This account signs in with ${profile.oauth_provider}.`
              : "No social provider linked to this account."}
          </p>
          <div className="mt-4 grid gap-2">
            {providers?.google_enabled && (
              <button
                onClick={() => signInWithOAuth("google", "/account")}
                className="min-h-11 rounded-sm border border-navy/20 bg-white px-4 text-sm font-medium text-navy hover:border-teal hover:text-teal"
              >
                {profile?.oauth_provider === "google" ? "Reconnect Google" : "Link Google"}
              </button>
            )}
            {providers?.facebook_enabled && (
              <button
                onClick={() => signInWithOAuth("facebook", "/account")}
                className="min-h-11 rounded-sm border border-navy/20 bg-white px-4 text-sm font-medium text-navy hover:border-teal hover:text-teal"
              >
                {profile?.oauth_provider === "facebook" ? "Reconnect Facebook" : "Link Facebook"}
              </button>
            )}
          </div>
        </aside>

        <aside className="rounded-sm border border-navy/15 bg-ghost p-5 sm:p-6">
          <p className="font-mono text-[11px] uppercase tracking-widest text-navy/50">Session</p>
          <p className="mt-3 text-sm text-navy/80">
            Signing out clears the access token stored on this device.
          </p>
          <button
            onClick={async () => {
              await logout();
              window.location.href = "/";
            }}
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-sm border border-navy/20 px-4 text-sm font-medium text-navy transition-colors hover:border-red-400 hover:text-red-600"
          >
            Sign out of this device
          </button>
        </aside>
      </div>
    </div>
  );
}

function ChangePasswordCard() {
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
    if (next.length < 8) return setErr("New password must be at least 8 characters.");
    if (next !== confirmPw) return setErr("The two passwords do not match.");
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
    <form onSubmit={onSubmit} className="rounded-sm border border-navy/15 bg-white p-5 sm:p-6">
      <h2 className="font-serif text-xl text-navy">Change password</h2>
      <p className="mt-1 text-sm text-navy/60">You stay signed in on this device.</p>
      <div className="mt-6 grid gap-4">
        <Field label="Current password">
          <input
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className="min-h-11 w-full rounded-sm border border-navy/20 px-3 text-sm text-navy focus:border-teal focus:outline-none"
            required
          />
        </Field>
        <Field label="New password">
          <input
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            className="min-h-11 w-full rounded-sm border border-navy/20 px-3 text-sm text-navy focus:border-teal focus:outline-none"
            required
            minLength={8}
          />
        </Field>
        <Field label="Confirm new password">
          <input
            type="password"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            className="min-h-11 w-full rounded-sm border border-navy/20 px-3 text-sm text-navy focus:border-teal focus:outline-none"
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
        className="mt-6 inline-flex min-h-11 items-center rounded-sm bg-navy px-5 text-sm font-medium text-white transition-colors hover:bg-teal disabled:opacity-60"
      >
        {busy ? "Updating" : "Update password"}
      </button>
    </form>
  );
}

function SetPasswordCard({ onDone }: { onDone: () => void }) {
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <form
      className="rounded-sm border border-navy/15 bg-white p-5 sm:p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setErr(null);
        try {
          await setPassword(pw);
          setMsg("Password set. You can now sign in with email and password.");
          setPw("");
          onDone();
        } catch (e2) {
          setErr(e2 instanceof Error ? e2.message : String(e2));
        } finally {
          setBusy(false);
        }
      }}
    >
      <h2 className="font-serif text-xl text-navy">Set a password</h2>
      <p className="mt-1 text-sm text-navy/60">
        This account signs in without a password today. Add one as a second way in.
      </p>
      <div className="mt-6">
        <Field label="New password">
          <input
            type="password"
            required
            minLength={8}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="min-h-11 w-full rounded-sm border border-navy/20 px-3 text-sm text-navy focus:border-teal focus:outline-none"
          />
        </Field>
      </div>
      {msg && <p className="mt-4 text-sm text-teal">{msg}</p>}
      {err && <p className="mt-4 text-sm text-red-600">{err}</p>}
      <button
        type="submit"
        disabled={busy}
        className="mt-6 inline-flex min-h-11 items-center rounded-sm bg-navy px-5 text-sm font-medium text-white hover:bg-teal disabled:opacity-60"
      >
        {busy ? "Saving" : "Set password"}
      </button>
    </form>
  );
}

function DangerZone({ hasPassword }: { hasPassword: boolean }) {
  const [busy, setBusy] = useState<"export" | "delete" | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [pw, setPw] = useState("");
  const [open, setOpen] = useState(false);

  const onExport = async () => {
    setBusy("export");
    setErr(null);
    setMsg(null);
    try {
      const data = await exportAccountData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `taxsailor-account-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMsg("Export downloaded.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  const onDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (confirmText !== "DELETE") return setErr('Type DELETE to confirm.');
    setBusy("delete");
    try {
      await deleteAccount(hasPassword ? pw : undefined);
      await logout();
      window.location.href = "/";
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : String(e2));
      setBusy(null);
    }
  };

  return (
    <div className="rounded-sm border border-navy/15 bg-white p-5 sm:p-6">
      <h2 className="font-serif text-xl text-navy">Your data</h2>
      <p className="mt-1 text-sm text-navy/60">
        Download everything we hold about your account, or close it permanently.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={onExport}
          disabled={busy !== null}
          className="inline-flex min-h-11 items-center rounded-sm border border-navy/20 px-4 text-sm font-medium text-navy hover:border-teal hover:text-teal disabled:opacity-60"
        >
          {busy === "export" ? "Preparing" : "Download my data"}
        </button>
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="inline-flex min-h-11 items-center rounded-sm border border-red-200 px-4 text-sm font-medium text-red-600 hover:border-red-400"
          >
            Delete account
          </button>
        )}
      </div>

      {open && (
        <form onSubmit={onDelete} className="mt-5 grid gap-3 rounded-sm border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-navy">
            This removes your profile, saved runs and settings. It cannot be undone.
          </p>
          {hasPassword && (
            <Field label="Current password">
              <input
                type="password"
                required
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                className="min-h-11 w-full rounded-sm border border-navy/20 px-3 text-sm text-navy focus:border-teal focus:outline-none"
              />
            </Field>
          )}
          <Field label="Type DELETE to confirm">
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="min-h-11 w-full rounded-sm border border-navy/20 px-3 font-mono text-sm text-navy focus:border-red-400 focus:outline-none"
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={busy !== null}
              className="inline-flex min-h-11 items-center rounded-sm bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
            >
              {busy === "delete" ? "Deleting" : "Delete my account"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex min-h-11 items-center rounded-sm border border-navy/20 px-4 text-sm text-navy"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {msg && <p className="mt-4 text-sm text-teal">{msg}</p>}
      {err && <p className="mt-4 text-sm text-red-600">{err}</p>}
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
