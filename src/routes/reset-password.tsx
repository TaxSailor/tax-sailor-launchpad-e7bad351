import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { AuthShell } from "@/components/auth/AuthShell";
import { resetPassword } from "@/lib/auth/session";

const searchSchema = z.object({
  token: z.string().optional(),
});

export const Route = createFileRoute("/reset-password")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Set a new password — TaxSailor" },
      { name: "description", content: "Choose a new password for your TaxSailor account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token } = useSearch({ from: "/reset-password" });
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!token) return setError("This reset link is missing its token. Request a new link.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirmPw) return setError("The two passwords do not match.");
    setBusy(true);
    try {
      await resetPassword(token, password);
      navigate({ to: "/workspace" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Then you go straight into your workspace"
      footer={
        <Link to="/forgot-password" className="text-teal hover:underline">
          Request a new link
        </Link>
      }
    >
      <form className="grid gap-3" onSubmit={onSubmit}>
        <label className="grid gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-widest text-navy/60">
            New password
          </span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="min-h-11 rounded-sm border border-navy/10 bg-white px-3 font-mono text-sm focus:border-teal focus:outline-none"
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-widest text-navy/60">
            Confirm password
          </span>
          <input
            type="password"
            required
            minLength={8}
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            className="min-h-11 rounded-sm border border-navy/10 bg-white px-3 font-mono text-sm focus:border-teal focus:outline-none"
          />
        </label>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="mt-1 min-h-11 rounded-sm bg-navy px-4 text-sm font-medium text-white transition-colors hover:bg-teal disabled:opacity-60"
        >
          {busy ? "Saving" : "Save password"}
        </button>
      </form>
    </AuthShell>
  );
}
