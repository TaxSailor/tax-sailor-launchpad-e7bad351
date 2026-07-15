// Account API surface — mirrors FastAPI /account/* endpoints.
// The backend does not expose per-run DELETE; runs can be renamed / annotated
// via PATCH /account/runs/{id} but not removed from the client. We simply
// omit a delete affordance in the UI.

import { api } from "@/lib/api";

export type AccountProfile = {
  id: string;              // numeric user_id serialised as string for the UI
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  locale: string;
  created_at: string;      // synthesized when the backend omits it
  email_verified?: boolean;
  has_password?: boolean;
  marketing_opt_in?: boolean;
};

type BackendProfile = {
  user_id: number;
  email: string;
  email_verified: boolean;
  has_password: boolean;
  display_name: string | null;
  avatar_url: string | null;
  avatar_uploaded: boolean;
  locale: string;
  marketing_opt_in: boolean;
};

function mapProfile(p: BackendProfile): AccountProfile {
  return {
    id: String(p.user_id),
    email: p.email,
    display_name: p.display_name,
    avatar_url: p.avatar_url,
    locale: p.locale,
    created_at: new Date().toISOString(),
    email_verified: p.email_verified,
    has_password: p.has_password,
    marketing_opt_in: p.marketing_opt_in,
  };
}

export function getProfile(): Promise<AccountProfile> {
  return api
    .get<BackendProfile>("/account/profile", {
      mock: () => ({
        user_id: 1,
        email: "you@taxsailor.com",
        email_verified: true,
        has_password: true,
        display_name: "You",
        avatar_url: null,
        avatar_uploaded: false,
        locale: "en",
        marketing_opt_in: false,
      }),
    })
    .then(mapProfile);
}

export function updateProfile(patch: {
  display_name?: string | null;
  locale?: string;
  marketing_opt_in?: boolean;
  avatar_url?: string | null;
}): Promise<AccountProfile> {
  return api
    .patch<BackendProfile>("/account/profile", patch as Record<string, unknown>, {
      mock: () => ({
        user_id: 1,
        email: "you@taxsailor.com",
        email_verified: true,
        has_password: true,
        display_name: patch.display_name ?? "You",
        avatar_url: patch.avatar_url ?? null,
        avatar_uploaded: false,
        locale: patch.locale ?? "en",
        marketing_opt_in: patch.marketing_opt_in ?? false,
      }),
    })
    .then(mapProfile);
}

// ---- Subscription ------------------------------------------------------

export type AccountSubscription = {
  tier: string;
  tier_label: string;
  status: "active" | "trialing" | "none" | string;
  renews_at: string | null;
  simulations_used: number;
  simulations_included: number | null;
};

export function getSubscription(): Promise<AccountSubscription> {
  return api.get<AccountSubscription>("/account/subscription", {
    mock: () => ({
      tier: "anonymous",
      tier_label: "Free preview",
      status: "none",
      renews_at: null,
      simulations_used: 0,
      simulations_included: 3,
    }),
  });
}

// ---- Saved runs --------------------------------------------------------

export type SavedRunSummary = {
  id: string;
  scenario_id: string;
  scenario_label: string;
  origin: string;
  destination: string;
  amount_eur: number;
  effective_tax_pct: number;   // 0..1 for the UI (backend gives % 0..100)
  created_at: string;
};

type BackendSavedRun = {
  id: number;
  title: string | null;
  notes: string | null;
  scenario_key: string | null;
  simulation_mode: string;
  source_label: string | null;
  target_label: string | null;
  retained_pct: number | null;
  created_at: string;
  gated: boolean | null;
};

type BackendSavedRunList = {
  total: number;
  limit: number;
  offset: number;
  runs: BackendSavedRun[];
};

function mapSavedRun(r: BackendSavedRun): SavedRunSummary {
  const retained = r.retained_pct ?? 0;
  return {
    id: String(r.id),
    scenario_id: r.scenario_key ?? r.simulation_mode ?? "corporate",
    scenario_label: r.title ?? r.scenario_key ?? r.simulation_mode ?? "Simulation",
    origin: r.source_label ?? "—",
    destination: r.target_label ?? "—",
    amount_eur: 0,
    effective_tax_pct: Math.max(0, Math.min(1, (100 - retained) / 100)),
    created_at: r.created_at,
  };
}

export function listRuns(): Promise<{ runs: SavedRunSummary[] }> {
  return api
    .get<BackendSavedRunList>("/account/runs?limit=50", {
      mock: () => ({
        total: 0,
        limit: 50,
        offset: 0,
        runs: [],
      }),
    })
    .then((r) => ({ runs: r.runs.map(mapSavedRun) }));
}

export type SavedRunReplay = SavedRunSummary & {
  request_payload: Record<string, unknown>;
  response_payload: Record<string, unknown> | null;
};

export function getSavedRun(runId: string): Promise<SavedRunReplay> {
  return api
    .get<BackendSavedRun & { request_payload: Record<string, unknown>; response_payload: Record<string, unknown> | null }>(
      `/account/runs/${encodeURIComponent(runId)}`,
      {
        mock: () => ({
          id: Number(runId) || 0,
          title: "Preview run",
          notes: null,
          scenario_key: "corporate_dividend",
          simulation_mode: "corporate_direct",
          source_label: "DE",
          target_label: "SG",
          retained_pct: 82,
          created_at: new Date().toISOString(),
          gated: false,
          request_payload: {},
          response_payload: null,
        }),
      },
    )
    .then((r) => ({
      ...mapSavedRun(r),
      request_payload: r.request_payload ?? {},
      response_payload: r.response_payload ?? null,
    }));
}

// Best-effort delete: backend has no DELETE for runs today, so this
// resolves to a no-op in real mode and is hidden in the UI.
export async function deleteRun(_runId: string): Promise<{ ok: true }> {
  return { ok: true as const };
}

// ---- Security ----------------------------------------------------------

export async function changePassword(current_password: string, new_password: string): Promise<void> {
  // Backend returns a fresh TokenResponse. We forward it into the session.
  const t = await api.post<{ access_token: string; expires_in: number; token_type?: string }>(
    "/account/change-password",
    { current_password, new_password },
    { mock: () => ({ access_token: "mock.token", expires_in: 3600 * 24 * 7 }) },
  );
  const { getAuthToken } = await import("@/lib/auth/session");
  // Rotate stored token in place so the current tab keeps working.
  const cur = getAuthToken();
  if (cur && typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem("taxsailor.session.v1");
      if (raw) {
        const parsed = JSON.parse(raw);
        parsed.token = t.access_token;
        parsed.expires_at = Date.now() + t.expires_in * 1000;
        window.localStorage.setItem("taxsailor.session.v1", JSON.stringify(parsed));
        // Force a reload of in-memory session state on next hook read.
        window.dispatchEvent(new StorageEvent("storage", { key: "taxsailor.session.v1" }));
      }
    } catch {
      /* noop */
    }
  }
}
