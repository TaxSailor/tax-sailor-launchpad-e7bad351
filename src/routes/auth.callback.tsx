import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { completeOAuthCallback, redeemMagicLink } from "@/lib/auth/session";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({ meta: [{ title: "Signing you in — TaxSailor" }, { name: "robots", content: "noindex" }] }),
  component: CallbackPage,
});

function CallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const magic = params.get("magic_token");
    const returnTo = params.get("return_to") ?? "/workspace";

    (async () => {
      try {
        if (magic) {
          await redeemMagicLink(magic);
        } else {
          await completeOAuthCallback(params);
        }
        navigate({ to: returnTo });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Sign-in failed");
      }
    })();
  }, [navigate]);

  return (
    <AuthShell title="Signing you in…" subtitle="One moment.">
      {error ? (
        <div className="grid gap-3 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <a href="/login" className="text-sm text-teal hover:underline">Back to sign in</a>
        </div>
      ) : (
        <div className="flex justify-center py-4">
          <div className="size-6 animate-spin rounded-full border-2 border-navy/20 border-t-navy" />
        </div>
      )}
    </AuthShell>
  );
}
