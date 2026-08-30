// Backend contract mirror — exact shapes of the TaxSailor FastAPI API (v0.8.0,
// simulation-v2). The app is mounted at /api in production (production_app.py),
// so every path below is sent WITHOUT the /api prefix from the client; the
// backendProxy server function prepends /api. Server entitlement fields drive
// all gating — the frontend never guesses a tier.
//
// Source of truth: /tmp/browser/tsrepo (TaxSailor/TaxSailor), verified live
// against https://www.taxsailor.com/api on 2026-08-30.

// ---- Entitlement tiers (src/core/entitlement_tier.py) -------------------
export type EntitlementTier =
  | "anonymous"
  | "registered_demo"
  | "consumer_paid"
  | "advisor_pro"
  | "admin";

// ---- Auth (src/data/schemas_auth.py) -----------------------------------
export type UserRole = "guest" | "demo" | "advisor" | "admin";

export type TokenResponse = {
  access_token: string;
  token_type?: string;
  expires_in: number;
};

export type UserResponse = {
  id: number;
  email: string;
  role: UserRole;
  created_at: string;
  entitlement_tier: EntitlementTier;
  is_admin: boolean;
  email_verified: boolean;
  has_password: boolean;
  advisor_plan_label?: string | null;
  simulation_credits_remaining?: number | null;
  simulation_credits_allowance?: number | null;
  display_name?: string | null;
  avatar_url?: string | null;
  oauth_provider?: string | null;
  oauth_import_profile_enabled?: boolean;
  oauth_profile_available?: boolean;
  oauth_pending_display_name?: string | null;
};

export type MagicLinkCreatedResponse = {
  message: string;
  expires_in: number;
  magic_link_token?: string | null; // dev/demo only
};

export type PasswordResetRequestedResponse = {
  message: string;
  expires_in?: number | null;
  reset_token?: string | null; // dev/test only
};

export type EmailVerificationRequestedResponse = {
  message: string;
  expires_in?: number | null;
  verify_token?: string | null; // dev/test only
};

export type EventQrResponse = {
  event: string;
  role: UserRole;
  access_token: string;
  token_type?: string;
  expires_in: number;
  message: string;
};

export type OAuthProvidersResponse = {
  providers: string[];
  google_enabled: boolean;
  facebook_enabled: boolean;
};

// Auth routes (all POST unless noted):
//   POST /auth/register            -> TokenResponse (201)
//   POST /auth/login               -> TokenResponse
//   POST /auth/magic-link          -> TokenResponse | MagicLinkCreatedResponse
//        (body {email} requests a link; body {token} verifies one)
//   GET  /auth/me                  -> UserResponse
//   POST /auth/forgot-password     -> PasswordResetRequestedResponse
//   POST /auth/reset-password      -> TokenResponse  (body {token, password})
//   POST /auth/verify-email        -> TokenResponse   (body {token})
//   POST /auth/resend-verification -> EmailVerificationRequestedResponse
//   POST /auth/request-verification-email -> EmailVerificationRequestedResponse
//   POST /auth/set-password        -> TokenResponse   (body {password}) — for OAuth-only accounts
// OAuth (src/api/routers/oauth.py):
//   GET  /oauth/providers          -> OAuthProvidersResponse
//   GET  /oauth/{provider}/authorize?return_to=...   (302 to provider)
//   GET  /oauth/{provider}/callback                 (302 back with token)
//   POST /oauth/profile-import     -> OAuthProfileImportResponse (body {enabled})
// Events (src/api/routers/events.py):
//   GET  /event/qr/{token}         -> EventQrResponse (demo-scoped JWT)

// ---- Account (src/data/schemas_account.py) -----------------------------
export type AccountProfileResponse = {
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

export type AccountProfileUpdateRequest = {
  display_name?: string | null;
  avatar_url?: string | null;
  locale?: string | null;
  marketing_opt_in?: boolean | null;
};

export type AccountAvatarUploadResponse = {
  profile: AccountProfileResponse;
  message: string;
};

export type AccountEmailChangeResponse = {
  message: string;
  profile: AccountProfileResponse;
  access_token: string;
  token_type?: string;
  expires_in: number;
  expires_in_verification?: number | null;
  verify_token?: string | null;
};

export type SavedRunSummary = {
  id: number;
  title?: string | null;
  notes?: string | null;
  scenario_key?: string | null;
  simulation_mode: string;
  source_label?: string | null;
  target_label?: string | null;
  retained_pct?: number | null;
  created_at: string;
  gated?: boolean | null;
};

export type SavedRunListResponse = {
  total: number;
  limit: number;
  offset: number;
  runs: SavedRunSummary[];
};

export type SavedRunReplayResponse = SavedRunSummary & {
  request_payload: Record<string, unknown>;
  response_payload?: Record<string, unknown> | null;
};

export type AccountActivityItem = {
  type: string;
  occurred_at: string;
  run_id: number;
  title?: string | null;
  notes_preview?: string | null;
  summary: string;
  scenario_key?: string | null;
  retained_pct?: number | null;
  gated?: boolean | null;
};

export type AccountActivityFeedResponse = {
  total_available: number;
  limit: number;
  items: AccountActivityItem[];
};

export type AccountSubscriptionResponse = {
  user_id: number;
  plan_id: string;
  plan_label: string;
  status: string;
  status_label: string;
  entitlement_tier: string;
  billing_email?: string | null;
  current_period_end?: string | null;
  upgrade_pricing_tier_id?: string | null;
  contact_to_upgrade: boolean;
  upgrade_message: string;
};

export type AccountSettingsResponse = {
  user_id: number;
  theme: string;
  email_notifications: boolean;
  product_updates: boolean;
  last_scenario_key?: string | null;
  last_workspace_state?: Record<string, unknown> | null;
  updated_at: string;
};

export type AccountSettingsUpdateRequest = {
  theme?: string | null;
  email_notifications?: boolean | null;
  product_updates?: boolean | null;
  last_scenario_key?: string | null;
  last_workspace_state?: Record<string, unknown> | null;
};

// Account routes:
//   GET    /account/profile                  -> AccountProfileResponse
//   PATCH  /account/profile                  -> AccountProfileResponse (AccountProfileUpdateRequest)
//   POST   /account/avatar                   -> AccountAvatarUploadResponse (multipart)
//   POST   /account/change-email             -> AccountEmailChangeResponse ({new_email, current_password?})
//   POST   /account/change-password          -> AccountProfileResponse ({current_password, new_password})
//   GET    /account/runs?limit=&offset=      -> SavedRunListResponse
//   GET    /account/runs/{id}                -> SavedRunReplayResponse
//   PATCH  /account/runs/{id}                -> SavedRunSummary ({title?, notes?})
//   GET    /account/activity?limit=          -> AccountActivityFeedResponse
//   GET    /account/subscription             -> AccountSubscriptionResponse
//   GET    /account/settings                 -> AccountSettingsResponse
//   PATCH  /account/settings                 -> AccountSettingsResponse (AccountSettingsUpdateRequest)
//   GET    /account/export                   -> GDPR export (JSON/binary)
//   DELETE /account                          -> {message} ({confirmation: "DELETE", current_password?})

// ---- Simulation (src/api/main.py) --------------------------------------
export type SimulationMode =
  | "corporate"
  | "corporate_direct"
  | "inheritance_property"
  | "inheritance_stocks";

export type SimulationPerspective = "individual" | "corporate" | "trust";

export type IncomeType =
  | "dividends" | "interest" | "royalties" | "capital_gains"
  | "employment_income" | "business_profit" | "rental_income" | "inheritance_gift";

export type AssetType =
  | "shares_listed" | "shares_unlisted" | "real_estate" | "ip_rights"
  | "cash_equivalents" | "business_operating" | "intangible_assets" | "tangible_assets";

// UserProfile required: origin_country, target_country. Defaults documented
// in src/data/schemas.py:207. Send the full profile from the scenario form.
export type UserProfile = {
  perspective: SimulationPerspective;
  origin_country: string;        // ISO code, e.g. "DE"
  target_country: string;        // ISO code, e.g. "AE"
  simulation_mode: SimulationMode;
  income_type: IncomeType;
  asset_type: AssetType;
  asset_value: number;           // EUR
  residency_years: number;       // default 0
  risk_appetite?: "low" | "medium" | "high";
  // advanced optional fields: substance, relocation, dependents/heirs,
  // corporate revenue/employees/profit, costs/timelines, beneficial
  // ownership, treaty eligibility, PE risk, AI-variable discovery.
  [key: string]: unknown;
};

export type RetainedPctBand =
  | "0–10%" | "10–20%" | "20–30%" | "30–40%" | "40–50%"
  | "50–60%" | "60–70%" | "70–80%" | "80–90%" | "90–100%";

export type PathEdgeDetail = {
  from_country: string;
  to_country: string;
  wht_rate_pct?: number | null;
  edge_type?: string;
  is_eu_directive?: boolean;
  is_statutory?: boolean;
  [key: string]: unknown;
};

export type CitationTeaser = {
  hop_index?: number | null;
  citation_type: string;
  title: string;
  wht_rate_masked?: string | null;
};

export type SimulationRequest = {
  source_country: string;        // full name, e.g. "Germany"
  target_country: string;        // full name, e.g. "United Arab Emirates"
  user_profile: UserProfile;
  mode: SimulationMode;
};

export type SimulationResponse = {
  optimal_path: string[];
  retained_earnings_pct?: number | null;     // null when gated
  tax_leakage_pct?: number | null;           // null when gated
  retained_pct_band?: RetainedPctBand | null;
  savings_band_eur?: string | null;
  retained_pct_masked?: string | null;
  tax_leakage_pct_masked?: string | null;
  hop_count?: number | null;
  compliance_flag_count?: number | null;
  teaser_headline?: string | null;
  citation_teasers: CitationTeaser[];
  gated: boolean;
  entitlement_tier?: string | null;
  compliance_warnings: string[];
  uses_statutory_edges: boolean;
  statutory_edge_details: string[];
  simulation_mode: string;
  perspective: string;
  compliance_pending_notice: string;
  unmapped_jurisdictions: string[];
  unmapped_on_path: string[];
  best_label_eligible: boolean;
  data_gaps: string[];
  unverified_cit_jurisdictions: string[];
  limitations: string[];
  optimality_note: string;
  path_details: PathEdgeDetail[];
  oecd_cbcr_xml?: string | null;
  globe_gir_xml?: string | null;
};

export type PathResult = {
  rank: number;
  path: string[];
  retained_earnings_pct?: number | null;
  tax_leakage_pct?: number | null;
  retained_pct_band?: RetainedPctBand | null;
  hops?: number | null;
  hop_count?: number | null;
  retained_pct_masked?: string | null;
  tax_leakage_pct_masked?: string | null;
  uses_statutory_edges: boolean;
  path_details: PathEdgeDetail[];
  unmapped_on_path: string[];
  best_label_eligible: boolean;
  compliance_warnings: string[];
};

export type TopPathsResponse = {
  total_paths_found: number;
  source_country: string;
  target_country: string;
  simulation_mode: string;
  perspective: string;
  compliance_pending_notice: string;
  unmapped_jurisdictions: string[];
  data_gaps: string[];
  limitations: string[];
  optimality_note: string;
  unverified_cit_jurisdictions: string[];
  gated: boolean;
  entitlement_tier?: string | null;
  paths: PathResult[];
};

export type BestDestinationsResponse = {
  candidates: number;
  compliance_pending_notice: string;
  data_gaps: string[];
  limitations: string[];
  gated: boolean;
  entitlement_tier?: string | null;
  destinations: Array<{
    destination: string;
    path: string[];
    retained_earnings_pct?: number | null;
    tax_leakage_pct?: number | null;
    retained_pct_band?: RetainedPctBand | null;
    hops?: number | null;
    best_label_eligible: boolean;
    routable: boolean;
    compliance_warnings: string[];
    limitations: string[];
  }>;
};

// Simulation routes:
//   POST /simulate                       -> SimulationResponse
//   POST /simulate/top-paths             -> TopPathsResponse  ({..., top_k: 1-50})
//   POST /simulate/best-destinations     -> BestDestinationsResponse
//   POST /simulate/export/cbcr           -> XML (SimulationRequest)
//   POST /simulate/export/gir            -> XML (SimulationRequest)
//   GET  /graph/summary                  -> {nodes, treaty_edges, statutory_edges, edges, jurisdictions[]}
//   GET  /jurisdictions                  -> JurisdictionModel[] (full name + code + treaties)

// ---- Evidence (documents) ---------------------------------------------
export type DocumentSourceResponse = {
  filename: string;
  document_type: string;
  party_a_code?: string | null;
  party_b_code?: string | null;
  title: string;
  [key: string]: unknown;
};

export type RouteHopSource = {
  from_jurisdiction: string;
  to_jurisdiction: string;
  from_code?: string | null;
  to_code?: string | null;
  wht_rate_pct?: number | null;
  edge_type: string;
  compliance_sources: number;
};

export type RouteSourcesResponse = {
  sources: DocumentSourceResponse[];
  compliance_sources: DocumentSourceResponse[];
  notice_sources: DocumentSourceResponse[];
  hops: RouteHopSource[];
  document_store_stats?: Record<string, unknown> | null;
  gated: boolean;
  entitlement_tier?: string | null;
};

export type EdgeCitationResponse = {
  hop_index: number;
  from_jurisdiction: string;
  to_jurisdiction: string;
  from_code?: string | null;
  to_code?: string | null;
  citation_type: string;
  legal_reference: string;
  summary: string;
  wht_rate_pct?: number | null;
  wht_rate_masked?: string | null;
  source_document_id?: number | null;
  penalty_rate_pct?: number | null;
  gated: boolean;
};

export type RouteCitationsResponse = {
  citations: EdgeCitationResponse[];
  citation_count: number;
  gated: boolean;
  entitlement_tier?: string | null;
};

// Evidence routes:
//   GET  /documents/summary             -> {total_sources, total_snippets, treaty_sources, ...}
//   POST /documents/route-sources       -> RouteSourcesResponse  ({path, path_details?})
//   POST /documents/route-citations    -> RouteCitationsResponse ({path (min 2), path_details?, compliance_warnings?})

// ---- Assistant (src/api/main.py) ---------------------------------------
export type AssistantWorkspaceAction = {
  label: string;
  flow_step?: string | null;
  scenario_id?: string | null;
  [key: string]: unknown;
};

export type UiContextPayload = {
  scenario_id?: string;
  scenario_label?: string;
  simulation_mode?: string;
  perspective?: string;
  source_country?: string;
  target_country?: string;
  origin_country?: string;
  source_code?: string | null;
  target_code?: string | null;
  origin_code?: string | null;
  asset_value?: number | null;
  scale_kind?: string | null;
  search_mode?: string | null;
  family_status?: string | null;
  residency_years?: number | null;
  shareholding_percent?: number | null;
  has_economic_ties_in_origin?: boolean | null;
  has_local_substance?: boolean | null;
};

export type ChatRequest = {
  messages: { role: string; content: string }[];
  active_result?: Record<string, unknown> | null;
  ui_context?: UiContextPayload | null;
};

export type ChatResponse = {
  reply: string;
  simulation_result?: SimulationResponse | null;
  gated: boolean;
  entitlement_tier?: string | null;
  teaser_headline?: string | null;
  workspace_actions: AssistantWorkspaceAction[];
  results_handoff: boolean;
  handoff_flow_step?: string | null;
  quality_guardrail_applied: boolean;
};

// Assistant route:
//   POST /ui/chat            -> ChatResponse
//   GET  /ui/conditions      -> UiConditions (display gating config)

// ---- Leads --------------------------------------------------------------
export type PricingLeadCreateRequest = {
  name: string;
  email: string;
  company?: string;
  tier_id: "consumer" | "professional" | "premium" | "enterprise";
  message: string;
  // honeypot: must be empty
};

export type PricingLeadCreatedResponse = {
  id: number;
  created_at: string;
};

// Leads route:
//   POST /leads/pricing  -> PricingLeadCreatedResponse (201)

// ---- Health -------------------------------------------------------------
export type HealthResponse = {
  status: string;
  database: string;
  version: string;
  api_version: string;
  compliance_rules_loaded: number;
  email_provider: string;
  email_delivery_enabled: boolean;
  oauth_providers: string[];
  google_oauth_enabled: boolean;
  facebook_oauth_enabled: boolean;
};

// GET /health -> HealthResponse
