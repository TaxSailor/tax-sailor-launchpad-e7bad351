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
