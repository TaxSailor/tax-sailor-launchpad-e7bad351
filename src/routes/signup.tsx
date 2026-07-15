import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell, OAuthButtons, AuthDivider } from "@/components/auth/AuthShell";
import { register, signInWithOAuth } from "@/lib/auth/session";
import { updateProfile } from "@/lib/workspace/account";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your account — TaxSailor" },
      { name: "description", content: "Create your TaxSailor workspace." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await register(email, password, name || undefined);
      navigate({ to: "/workspace" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-up failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start with a workspace — upgrade when you're ready."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-teal hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <OAuthButtons onClick={(p) => signInWithOAuth(p, "/workspace")} />
      <AuthDivider />
      <form className="grid gap-3" onSubmit={onSubmit}>
        <label className="grid gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-widest text-navy/60">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-sm border border-navy/10 bg-white px-3 py-2.5 text-sm font-mono focus:border-teal focus:outline-none"
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-widest text-navy/60">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-sm border border-navy/10 bg-white px-3 py-2.5 text-sm font-mono focus:border-teal focus:outline-none"
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-widest text-navy/60">Password</span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-sm border border-navy/10 bg-white px-3 py-2.5 text-sm font-mono focus:border-teal focus:outline-none"
          />
        </label>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="mt-1 rounded-sm bg-navy px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal disabled:opacity-60"
        >
          {busy ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
