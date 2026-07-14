// Account API surface: profile, subscription, saved runs.
// Mirrors FastAPI /api/account/* endpoints; mock mode returns fixtures.

import { api } from "@/lib/api";
import type { PricingEntitlementTier } from "@/lib/pricing";

export type AccountProfile = {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  locale: string;
  created_at: string;
};

export type AccountSubscription = {
  tier: PricingEntitlementTier | "free";
  tier_label: string;
  status: "active" | "trialing" | "none";
  renews_at: string | null;
  simulations_used: number;
  simulations_included: number | null;
};

export type SavedRunSummary = {
  id: string;
  scenario_id: string;
  scenario_label: string;
  origin: string;
  destination: string;
  amount_eur: number;
  effective_tax_pct: number;
  created_at: string;
};

const now = () => new Date().toISOString();

export function getProfile() {
  return api.get<AccountProfile>("/api/account/profile", {
    mock: () => ({
      id: "mock-user",
      email: "you@taxsailor.com",
      display_name: "You",
      avatar_url: null,
      locale: "en",
      created_at: now(),
    }),
  });
}

export function updateProfile(patch: Partial<Pick<AccountProfile, "display_name" | "locale">>) {
  return api.patch<AccountProfile>("/api/account/profile", patch, {
    mock: () => ({
      id: "mock-user",
      email: "you@taxsailor.com",
      display_name: patch.display_name ?? "You",
      avatar_url: null,
      locale: patch.locale ?? "en",
      created_at: now(),
    }),
  });
}

export function getSubscription() {
  return api.get<AccountSubscription>("/api/account/subscription", {
    mock: () => ({
      tier: "free",
      tier_label: "Free preview",
      status: "none",
      renews_at: null,
      simulations_used: 2,
      simulations_included: 3,
    }),
  });
}

export function listRuns() {
  return api.get<{ runs: SavedRunSummary[] }>("/api/account/runs", {
    mock: () => ({
      runs: [
        {
          id: "run_demo_1",
          scenario_id: "corporate_dividend",
          scenario_label: "Corporate dividend",
          origin: "DE",
          destination: "CY",
          amount_eur: 250_000,
          effective_tax_pct: 0.128,
          created_at: now(),
        },
        {
          id: "run_demo_2",
          scenario_id: "relocation",
          scenario_label: "Relocation",
          origin: "DE",
          destination: "PT",
          amount_eur: 120_000,
          effective_tax_pct: 0.204,
          created_at: now(),
        },
      ],
    }),
  });
}

export function deleteRun(runId: string) {
  return api.del<{ ok: true }>(`/api/account/runs/${runId}`, {
    mock: () => ({ ok: true as const }),
  });
}

export function changePassword(current_password: string, new_password: string) {
  return api.post<{ ok: true }>(
    "/api/account/change-password",
    { current_password, new_password },
    { mock: () => ({ ok: true as const }) },
  );
}
