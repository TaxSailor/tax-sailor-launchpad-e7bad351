# W2 — Finish and publish the website

Plan: `.lovable/plan/w2-complete-the-product-surface-in-the-new-design-2026-08-30.md`
Backend target: taxsailor.com via Render (FastAPI mounted at `/api`).
Landing page: final, unchanged. No AI fluff, no en/em dashes. Responsive 360/768/1280/1920.

## Batch 0 — Backend contract lock, route inventory, live verification — DONE

- Created `src/lib/api-proxy.functions.ts`: TanStack server function that forwards
  to `${TAXSAILOR_API_BASE}/api${path}` (default https://www.taxsailor.com).
  Forwards caller bearer token; adds no privileges; returns `{ok,status,body}`.
  Server-to-server, so backend CORS (taxsailor.com only) never blocks preview.
- Rewrote `src/lib/api.ts` to route every call through `backendProxy`. Paths are
  plain backend contract (no `/api` prefix; proxy prepends it). Kept `mock` option
  accepted-but-ignored so existing call sites still typecheck. `api.{get,post,
  patch,del}` signatures preserved.
- Fixed narrowing error in `workspace.scenario.$scenarioId.tsx` (loader 404s on
  unknown ids; component uses `getScenario(id)!`).
- Created `src/lib/contracts.ts`: typed mirror of every backend response model
  (auth, account, simulation, top-paths, best-destinations, evidence, chat,
  leads, health) with exact field names, entitlement tiers, retained bands,
  and the full route map with HTTP methods.
- Live verification (curl to https://www.taxsailor.com/api):
  - GET /health -> 200, v0.8.0, simulation-v2, Google OAuth on, Resend on.
  - GET /jurisdictions -> 200.
  - POST /simulate (Germany -> UAE, anonymous) -> gated response with
    citation_teasers, compliance_warnings, unmapped_jurisdictions, data_gaps,
    entitlement_tier, limitations, path_details.
- Typecheck: green (`npx tsgo --noEmit`, no errors).

### Open items (carry into Batch 1)
- Proxy transport end-to-end (browser -> server fn -> backend) not yet runtime
  verified; needs an authenticated workspace call. Confirm with the test
  account at the start of Batch 1.
- Avatar upload (multipart FormData) does not go through the JSON proxy yet;
  handle in Batch 4 (account/avatar) — add a binary-capable path or a direct
  signed upload.
- OAuth callback redirect-origin validation may reject the Lovable preview
  origin; verify and (if needed) route the callback server-side in Batch 4.

### Backend route map (paths WITHOUT /api; proxy prepends it)
Auth:      /auth/register /auth/login /auth/magic-link /auth/me /auth/forgot-password
           /auth/reset-password /auth/verify-email /auth/resend-verification
           /auth/request-verification-email /auth/set-password
OAuth:     /oauth/providers /oauth/{p}/authorize /oauth/{p}/callback
           /oauth/profile-import
Events:    /event/qr/{token}
Account:   /account/profile /account/avatar /account/change-email
           /account/change-password /account/runs /account/runs/{id}
           /account/activity /account/subscription /account/settings
           /account/export /account (DELETE)
Simulate:  /simulate /simulate/top-paths /simulate/best-destinations
           /simulate/export/cbcr /simulate/export/gir
Graph:     /graph/summary /jurisdictions
Evidence:  /documents/summary /documents/route-sources /documents/route-citations
Assistant: /ui/chat /ui/conditions
Leads:     /leads/pricing
Health:    /health

## Batch 1 — Workspace entry, scenarios, questionnaire, search, persistence — NEXT

## Batch 2 — Results, paths, bands, proof, exports — TODO
## Batch 3 — Evidence + server-driven gating — TODO
## Batch 4 — Account/auth depth, security, GDPR, avatar, saved-run editor, OAuth — TODO
## Batch 5 — Demo + assistant, QR flow, chat handoff, gating, analytics — TODO
## Batch 6 — Links, metadata, images, bundle/performance, responsive, deploy, repo private — TODO

## Batch 0 verification closed (2026-08-30)

Authenticated verification against https://www.taxsailor.com/api using the
provided admin account:

- POST /auth/login -> 200, returns { access_token, token_type, expires_in }.
  The user object is NOT part of the login response; the client must call
  /auth/me after login.
- GET /auth/me -> 200. role=admin, entitlement_tier=admin, is_admin=true,
  email_verified=true, has_password=true. Also returns display_name,
  avatar_url, oauth_provider, oauth_import_profile_enabled,
  oauth_profile_available, advisor_plan_label, simulation_credits_remaining,
  simulation_credits_allowance.
- GET /account/profile -> 200 (locale, marketing_opt_in, avatar_uploaded).
- GET /account/subscription -> 200 (plan_id=admin, plan_label,
  status/status_label, upgrade_pricing_tier_id, contact_to_upgrade,
  upgrade_message).
- GET /account/runs -> 200 { total, limit, offset, runs: [] } (no saved runs
  on this account yet).
- POST /simulate requires source_country, target_country, user_profile
  (mode optional, defaults to corporate). Germany -> UAE as admin returned
  gated=false, retained_earnings_pct=70, tax_leakage_pct=30,
  optimal_path=[Germany, Bahrain, United Arab Emirates], retained_pct_band=null.
- POST /simulate/top-paths -> 200 with ranked paths incl. path_details
  (from_jurisdiction, to_jurisdiction, wht_rate_pct, edge_type, is_statutory),
  hops, masks, best_label_eligible.
- Preview transport confirmed: the server proxy reached /api/health with
  status 200 from the preview runtime, so the CORS restriction is bypassed
  as designed.

Contract corrections to apply in Batch 1:
- Path detail fields are from_jurisdiction/to_jurisdiction/wht_rate_pct,
  not from_country/to_country/wht_rate.
- Login must be a two-step flow: /auth/login then /auth/me.

## Batch 1 — Workspace entry, scenarios, questionnaire, search, persistence — DONE (2026-08-30)

Contract corrections discovered from the live OpenAPI document
(https://www.taxsailor.com/api/openapi.json):
- GET /jurisdictions returns `{ jurisdictions: [{ code, name }] }` (125 rows).
  Simulation endpoints take and return jurisdiction NAMES ("Germany",
  "United Arab Emirates"); ISO codes are only used to render flags.
- PathEdgeDetail = from_jurisdiction, to_jurisdiction, wht_rate_pct,
  edge_type, is_statutory (no note field).
- AssetType enum: shares_listed, shares_unlisted, real_estate, ip_rights,
  business_interest, financial_assets, mixed (no cash_equivalents /
  business_operating — those were wrong before).
- FamilyStatus enum: single, married, married_with_children,
  single_with_children (no "family").
- OAuth routes are /auth/oauth/... not /oauth/... — fix in Batch 4.
- Saved runs: GET/PATCH/DELETE /account/runs/{id}; no POST (the backend
  persists runs itself). Account delete is POST /account/delete.
- Gating fields available: retained_pct_band, retained_pct_masked,
  tax_leakage_pct_masked, savings_band_eur, citation_teasers,
  compliance_flag_count, teaser_headline, best_label_eligible.

Shipped:
- `src/lib/workspace/jurisdictions.ts`: catalogue loader + cache, name->code
  map, flagFor(), searchJurisdictions().
- `src/components/workspace/JurisdictionSelect.tsx`: searchable, keyboard
  accessible combobox over all 125 jurisdictions, 44px targets.
- `src/lib/workspace/scenarios.ts` rewritten: correct enums, name-based wire
  values, per-scenario defaults, richer UserProfile (risk appetite, substance,
  dependents, heir countries, asset location, annual profit), session run
  index (`listRecentRuns`), and `loadRunFromAccount()` so numeric run ids
  deep-link across sessions. All mock branches removed.
- Workspace index redesigned: audience filter, corridor preview per scenario,
  "this session" snapshots, saved-runs list from /account/runs.
- Questionnaire redesigned in three numbered sections (corridor, scale,
  profile) with corridor swap, amount presets, risk-appetite cards, deep-link
  search params (?from=&to=&amount=), inline error surface.
- Results page fixed to the real contract: name+flag route chips, correct
  per-hop columns, treaty vs statutory basis, citation teasers, band/masked
  values when gated, statutory-edge notes, "Adjust inputs" deep link back to
  the questionnaire, account-run rehydration with loading and empty states.
- Typecheck green (npx tsgo --noEmit).

Carry into Batch 2:
- Top-K alternate paths UI (`runTopPaths` client exists, no UI yet).
- /simulate/best-destinations, /simulate/export/cbcr, /simulate/export/gir.
- Retire the remaining IS_MOCK_API / API_BASE_URL references in
  AuthShell.tsx, AssistantChat.tsx and auth/session.ts.

## Batch 2 — Results depth, ranked paths, destination scan, exports — DONE (2026-08-30)

Shipped:
- `src/lib/workspace/scenarios.ts`: added `runBestDestinations`
  (POST /simulate/best-destinations, top_n), `fetchExportXml` for
  /simulate/export/cbcr and /simulate/export/gir (accepts raw XML string or
  {xml|content} envelope), and a shared `downloadText` helper.
- `src/components/workspace/AlternateRoutes.tsx`: on-demand top-K panel.
  Shows rank, full flagged route, retained share (exact, masked or band),
  hop count, treaty vs statutory basis, compliance-note count, and marks the
  route currently open.
- `src/components/workspace/BestDestinations.tsx`: on-demand destination scan
  table (destination, retained, hops, route, routable flag).
- Results page: both panels mounted, export buttons now work whether the XML
  came inline in the simulate response or has to be fetched from the export
  endpoints, with per-button busy and error states. Removed the old
  inline-only DownloadButton.
- Mock plumbing retired end to end: `IS_MOCK_API` / `API_BASE_URL` and all
  `mock:` call options removed from api.ts, auth/session.ts, workspace/account.ts,
  admin.ts, LeadForm.tsx, AuthShell.tsx. AssistantChat now posts through the
  proxy to /ui/chat (the local /api/assistant gateway route is no longer used).
  session.ts login/register/magic-link/reset all go token -> /auth/me;
  OAuth authorize now points at /api/auth/oauth/{provider}/authorize.

Verification: `npx tsgo --noEmit` clean; /workspace responds 200.

Carry into Batch 3:
- Evidence surfaces: /documents/summary, /documents/route-sources,
  /documents/route-citations.
- Server-driven gating polish (entitlement tier badges, upgrade prompts).
- Decide whether to delete `src/routes/api/assistant.ts` (now unused).

## Batch 3 — Evidence surfaces and gating polish — DONE (2026-08-30)

Shipped:
- `src/lib/workspace/evidence.ts`: clients for GET /documents/summary,
  POST /documents/route-sources, POST /documents/route-citations (path,
  path_details, compliance_warnings passed through when present).
- `src/components/workspace/EvidencePanel.tsx`: on-demand evidence panel on the
  results page. Per-hop legal reference cards (corridor with flags, citation
  type, legal reference, summary, exact or masked withholding rate, penalty
  loading) plus grouped treaty, compliance and notice source lists, reference
  counts, entitlement tier line, and a gated upgrade note linking to /pricing.
- Results page mounts EvidencePanel with the run's path, path_details and
  compliance warnings.
- Removed the now unused local gateway route `src/routes/api/assistant.ts`
  (assistant chat goes through the backend proxy to /ui/chat).

Verification: `npx tsgo --noEmit` clean.

Carry into Batch 4 (account/auth depth):
- Profile edit, password change, avatar multipart upload through the proxy,
  GDPR export/delete, saved-run management, OAuth provider linking.

## Batch 4 — done
- Transport: src/lib/api-types.ts, src/lib/backend.server.ts, proxy upload path, api.upload().
- Session: applyToken(), refreshUser() exported.
- Account API: profile, avatar upload/remove, change email, change/set password, resend verification,
  subscription, settings, saved runs list/replay/update/delete, activity, GDPR export, delete, OAuth providers.
- /account redesigned: Profile, Subscription, Saved runs, Preferences, Security tabs with avatar,
  verification card, email change, credit meter, run editor, theme/notification prefs, password set/change,
  provider linking, data export and account deletion. 44px targets, real empty/loading/error states.
- New routes: /forgot-password, /reset-password. Login now links to password recovery.
- Typecheck green; /account returns 200.
Next: Batch 5 — /demo QR proof surface, assistant handoff, analytics events.

## Batch 5 — Demo surface and assistant — DONE (2026-08-30)
- src/lib/demo.ts: redeemQrToken() over GET /event/qr/{token} (skipAuth, commits the
  demo bearer via applyToken) plus the DEMO_CORRIDOR constant (Germany to UAE, EUR 1m).
- src/routes/demo.tsx: public /demo proof surface. One-run corridor card (retained,
  leakage, hops, flagged route chips, compliance notes, briefing and workspace CTAs),
  event-code panel with auto-redeem from ?token= / ?t=, shareable QR link with copy,
  and a next-steps block. Own head() metadata, 44px targets, real loading/error states.
- AssistantChat rebuilt: starter prompts, ui_context + active_result sent with every
  turn (scenario, corridor, codes, amount, last result), workspace_actions rendered as
  deep links into /workspace/scenario/$scenarioId with from/to/amount, gating teaser
  with /pricing link, results handoff navigation, 8s retry cooldown, context line.
- /demo added to nav, footer and sitemap.
Verification: tsgo clean; /demo returns 200.
Next: Batch 6 — link audit, head metadata sweep, performance and responsive pass, publish prep.
