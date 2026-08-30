// Account API surface — mirrors the FastAPI /account/* endpoints exactly.
//
//   GET    /account/profile          -> AccountProfileResponse
//   PATCH  /account/profile          -> AccountProfileResponse
//   POST   /account/avatar           -> { profile, message }   (multipart "file")
//   DELETE /account/avatar           -> AccountProfileResponse
//   POST   /account/change-email     -> { message, profile, access_token, ... }
//   POST   /account/change-password  -> TokenResponse
//   GET    /account/runs             -> { total, limit, offset, runs[] }
//   GET    /account/runs/{id}        -> SavedRunReplayResponse
//   PATCH  /account/runs/{id}        -> SavedRunSummary
//   DELETE /account/runs/{id}        -> 204
//   GET    /account/activity         -> { total_available, limit, items[] }
//   GET    /account/subscription     -> AccountSubscriptionResponse
//   GET    /account/settings         -> AccountSettingsResponse
//   PATCH  /account/settings         -> AccountSettingsResponse
//   GET    /account/export           -> full GDPR export payload
//   POST   /account/delete           -> { message }

import { api } from "@/lib/api";
import { applyToken } from "@/lib/auth/session";

// ---- Profile -----------------------------------------------------------

export type AccountProfile = {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  avatar_uploaded: boolean;
  locale: string;
  email_verified: boolean;
  has_password: boolean;
  marketing_opt_in: boolean;
  oauth_provider?: string | null;
};

type BackendProfile = {
  user_id: number;
  email: string;
  email_verified: boolean;
  has_password: boolean;
  display_name: string | null;
  avatar_url: string | null;
  avatar_uploaded?: boolean;
  locale: string;
  marketing_opt_in: boolean;
  oauth_provider?: string | null;
};

function mapProfile(p: BackendProfile): AccountProfile {
  return {
    id: String(p.user_id),
    email: p.email,
    display_name: p.display_name,
    avatar_url: p.avatar_url,
    avatar_uploaded: p.avatar_uploaded ?? false,
    locale: p.locale,
    email_verified: p.email_verified,
    has_password: p.has_password,
    marketing_opt_in: p.marketing_opt_in,
    oauth_provider: p.oauth_provider ?? null,
  };
}

export function getProfile(): Promise<AccountProfile> {
  return api.get<BackendProfile>("/account/profile").then(mapProfile);
}

export function updateProfile(patch: {
  display_name?: string | null;
  locale?: string;
  marketing_opt_in?: boolean;
  avatar_url?: string | null;
}): Promise<AccountProfile> {
  return api
    .patch<BackendProfile>("/account/profile", patch as Record<string, unknown>)
    .then(mapProfile);
}

export function uploadAvatar(file: File): Promise<AccountProfile> {
  return api
    .upload<{ profile: BackendProfile; message?: string }>("/account/avatar", file)
    .then((r) => mapProfile(r.profile));
}

export function removeAvatar(): Promise<AccountProfile> {
  return api.del<BackendProfile>("/account/avatar").then(mapProfile);
}

// ---- Email and password ------------------------------------------------

export async function changeEmail(
  new_email: string,
  current_password?: string,
): Promise<{ message: string; profile: AccountProfile }> {
  const r = await api.post<{
    message: string;
    profile: BackendProfile;
    access_token: string;
    expires_in: number;
  }>("/account/change-email", {
    new_email,
    ...(current_password ? { current_password } : {}),
  });
  await applyToken(r.access_token, r.expires_in);
  return { message: r.message, profile: mapProfile(r.profile) };
}

export async function changePassword(
  current_password: string,
  new_password: string,
): Promise<void> {
  const t = await api.post<{ access_token: string; expires_in: number }>(
    "/account/change-password",
    { current_password, new_password },
  );
  await applyToken(t.access_token, t.expires_in);
}

export async function setPassword(password: string): Promise<void> {
  const t = await api.post<{ access_token: string; expires_in: number }>("/auth/set-password", {
    password,
  });
  await applyToken(t.access_token, t.expires_in);
}

export function resendVerificationEmail(): Promise<{ message: string; expires_in?: number }> {
  return api.post<{ message: string; expires_in?: number }>("/auth/resend-verification");
}

// ---- Subscription ------------------------------------------------------

export type AccountSubscription = {
  plan_id: string;
  plan_label: string;
  status: string;
  status_label: string;
  entitlement_tier: string;
  billing_email: string | null;
  current_period_end: string | null;
  upgrade_pricing_tier_id: string | null;
  contact_to_upgrade: boolean;
  upgrade_message: string;
  simulation_credits_remaining?: number | null;
  simulation_credits_allowance?: number | null;
};

export function getSubscription(): Promise<AccountSubscription> {
  return api.get<AccountSubscription>("/account/subscription");
}

// ---- Settings ----------------------------------------------------------

export type AccountSettings = {
  theme: string;
  email_notifications: boolean;
  product_updates: boolean;
  last_scenario_key: string | null;
  updated_at: string;
};

export function getSettings(): Promise<AccountSettings> {
  return api.get<AccountSettings>("/account/settings");
}

export function updateSettings(patch: {
  theme?: string;
  email_notifications?: boolean;
  product_updates?: boolean;
}): Promise<AccountSettings> {
  return api.patch<AccountSettings>("/account/settings", patch as Record<string, unknown>);
}

// ---- Saved runs --------------------------------------------------------

export type SavedRunSummary = {
  id: string;
  title: string | null;
  notes: string | null;
  scenario_id: string;
  scenario_label: string;
  mode: string;
  origin: string;
  destination: string;
  retained_pct: number | null;
  gated: boolean;
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

function mapSavedRun(r: BackendSavedRun): SavedRunSummary {
  return {
    id: String(r.id),
    title: r.title,
    notes: r.notes,
    scenario_id: r.scenario_key ?? r.simulation_mode ?? "corporate",
    scenario_label: r.title ?? r.scenario_key ?? r.simulation_mode ?? "Simulation",
    mode: r.simulation_mode,
    origin: r.source_label ?? "Not recorded",
    destination: r.target_label ?? "Not recorded",
    retained_pct: r.retained_pct,
    gated: r.gated ?? false,
    created_at: r.created_at,
  };
}

export function listRuns(
  opts: { limit?: number; offset?: number } = {},
): Promise<{ runs: SavedRunSummary[]; total: number; limit: number; offset: number }> {
  const limit = opts.limit ?? 50;
  const offset = opts.offset ?? 0;
  return api
    .get<{ total: number; limit: number; offset: number; runs: BackendSavedRun[] }>(
      `/account/runs?limit=${limit}&offset=${offset}`,
    )
    .then((r) => ({
      runs: r.runs.map(mapSavedRun),
      total: r.total,
      limit: r.limit,
      offset: r.offset,
    }));
}

export type SavedRunReplay = SavedRunSummary & {
  request_payload: Record<string, unknown>;
  response_payload: Record<string, unknown> | null;
};

export function getSavedRun(runId: string): Promise<SavedRunReplay> {
  return api
    .get<
      BackendSavedRun & {
        request_payload: Record<string, unknown>;
        response_payload: Record<string, unknown> | null;
      }
    >(`/account/runs/${encodeURIComponent(runId)}`)
    .then((r) => ({
      ...mapSavedRun(r),
      request_payload: r.request_payload ?? {},
      response_payload: r.response_payload ?? null,
    }));
}

export function updateRun(
  runId: string,
  patch: { title?: string | null; notes?: string | null },
): Promise<SavedRunSummary> {
  return api
    .patch<BackendSavedRun>(
      `/account/runs/${encodeURIComponent(runId)}`,
      patch as Record<string, unknown>,
    )
    .then(mapSavedRun);
}

export function deleteRun(runId: string): Promise<unknown> {
  return api.del(`/account/runs/${encodeURIComponent(runId)}`);
}

// ---- Activity ----------------------------------------------------------

export type ActivityItem = {
  type: string;
  occurred_at: string;
  run_id: number;
  title: string | null;
  notes_preview: string | null;
  summary: string;
  scenario_key: string | null;
  retained_pct: number | null;
  gated: boolean | null;
};

export function getActivity(limit = 10): Promise<{ items: ActivityItem[]; total_available: number }> {
  return api.get<{ items: ActivityItem[]; total_available: number; limit: number }>(
    `/account/activity?limit=${limit}`,
  );
}

// ---- GDPR --------------------------------------------------------------

export function exportAccountData(): Promise<unknown> {
  return api.get<unknown>("/account/export");
}

export function deleteAccount(current_password?: string): Promise<{ message: string }> {
  return api.post<{ message: string }>("/account/delete", {
    confirmation: "DELETE",
    ...(current_password ? { current_password } : {}),
  });
}

// ---- OAuth providers ---------------------------------------------------

export type OAuthProviders = {
  providers: string[];
  google_enabled: boolean;
  facebook_enabled: boolean;
};

export function getOAuthProviders(): Promise<OAuthProviders> {
  return api.get<OAuthProviders>("/auth/oauth/providers");
}
