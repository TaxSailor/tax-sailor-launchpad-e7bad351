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
    // Backend redirects with either query params or a URL fragment.
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    // Also fold in fragment params (`#access_token=…`) which some OAuth
    // flows use to keep tokens out of server logs.
    if (url.hash.startsWith("#")) {
      const fragment = new URLSearchParams(url.hash.slice(1));
      fragment.forEach((value, key) => {
        if (!params.has(key)) params.set(key, value);
      });
    }

    const magic = params.get("magic_token") ?? params.get("token");
    const returnTo = params.get("return_to") ?? "/workspace";
    const errorParam = params.get("error") ?? params.get("error_description");

    (async () => {
      try {
        if (errorParam) throw new Error(errorParam);
        if (magic && !params.get("access_token")) {
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
