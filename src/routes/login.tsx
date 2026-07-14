import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { AuthShell, OAuthButtons, AuthDivider } from "@/components/auth/AuthShell";
import { login, requestMagicLink, signInWithOAuth } from "@/lib/auth/session";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/login")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Sign in — TaxSailor" },
      { name: "description", content: "Sign in to your TaxSailor workspace." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/login" });
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicSent, setMagicSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "password") {
        await login(email, password);
        navigate({ to: redirect ?? "/workspace" });
      } else {
        await requestMagicLink(email);
        setMagicSent(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Sign in"
      subtitle="Continue to your TaxSailor workspace"
      footer={
        <>
          New to TaxSailor?{" "}
          <Link to="/signup" className="text-teal hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <OAuthButtons onClick={(p) => signInWithOAuth(p, redirect ?? "/workspace")} />
      <AuthDivider />

      {magicSent ? (
        <div className="grid gap-2 py-2 text-center text-sm text-navy">
          <p className="font-serif text-lg">Check your inbox.</p>
          <p className="text-navy/60">We sent a sign-in link to {email}.</p>
        </div>
      ) : (
        <form className="grid gap-3" onSubmit={onSubmit}>
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
          {mode === "password" && (
            <label className="grid gap-1.5">
              <span className="text-[11px] font-medium uppercase tracking-widest text-navy/60">Password</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-sm border border-navy/10 bg-white px-3 py-2.5 text-sm font-mono focus:border-teal focus:outline-none"
              />
            </label>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="mt-1 rounded-sm bg-navy px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal disabled:opacity-60"
          >
            {busy ? "Signing in…" : mode === "password" ? "Sign in" : "Send magic link"}
          </button>
          <button
            type="button"
            onClick={() => setMode(mode === "password" ? "magic" : "password")}
            className="text-center text-xs text-navy/60 hover:text-teal"
          >
            {mode === "password" ? "Use a magic link instead" : "Use password instead"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
