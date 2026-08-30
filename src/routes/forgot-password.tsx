import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { forgotPassword } from "@/lib/auth/session";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your password — TaxSailor" },
      { name: "description", content: "Request a password reset link for your TaxSailor account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We send a reset link to your email address"
      footer={
        <Link to="/login" className="text-teal hover:underline">
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <div className="grid gap-2 py-2 text-center text-sm text-navy">
          <p className="font-serif text-lg">Check your inbox.</p>
          <p className="text-navy/60">
            If an account exists for {email}, a reset link is on its way. The link expires in one
            hour.
          </p>
        </div>
      ) : (
        <form className="grid gap-3" onSubmit={onSubmit}>
          <label className="grid gap-1.5">
            <span className="text-[11px] font-medium uppercase tracking-widest text-navy/60">
              Email
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-h-11 rounded-sm border border-navy/10 bg-white px-3 font-mono text-sm focus:border-teal focus:outline-none"
            />
          </label>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="mt-1 min-h-11 rounded-sm bg-navy px-4 text-sm font-medium text-white transition-colors hover:bg-teal disabled:opacity-60"
          >
            {busy ? "Sending" : "Send reset link"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
