
# Redesign plan — full TaxSailor app on Scientific Ledger

## What's in the private repo (source of truth)

Backend (`src/api/` — FastAPI on Render service `taxsailor-web`, `/api/*` prefix):
- Routers: `auth.py`, `oauth.py`, `account.py`, `leads.py`, `events.py`
- Engine: `src/core/` (Dijkstra tax route optimizer, treaty data)
- DB: `tax_database.db` (SQLite in repo; Postgres in prod)

Frontend (`frontend/src/` — React SPA + react-router-dom):
- Routes: `/`, `/demo`, `/workspace`, `/pricing`, `/account`, `/login`
- Features: auth (magic link, email/pw, Google + Facebook OAuth), account (profile, avatar, GDPR export, run history, subscription), pricing/paywall, workspace (scenario picker → guided questionnaire → simulation), results (RouteFlowChart, ComparisonTable, evidence panel, PDF export), assistant chat, demo QR flow

Docs (`docs/product/`, `docs/business/`, `docs/*.tex`):
- Phase 31–33 sprint plans, E2E matrices, security review, WhitePaper.tex, Tech_Sprint_Documentation.tex

## Strategy — the split

- **Keep FastAPI backend on Render, untouched.** It's the tax engine, the source of correctness, and it already has auth, OAuth, treaties, and the Dijkstra kernel. Rebuilding that on Lovable Cloud would take months and risk correctness regressions on the exact thing you're pitching investors.
- **Rebuild `frontend/` here on Scientific Ledger.** This Lovable project becomes the new frontend. It talks to `https://<render-host>/api/*` via a `VITE_API_BASE_URL` env var. On merge, the new build replaces the Render service's static frontend.
- **Drop Lovable Cloud auth / `leads` table from this project.** Your real backend already owns auth, users, and leads. Keep the Lovable-Cloud lead form only if you want a marketing shadow list; otherwise remove it and point the marketing forms at `/api/leads` too. (Decision needed — see Open questions.)

## Route inventory to build

Marketing (already partially done here — refine, don't rebuild):
- `/` (home), `/about`, `/contact`, `/investors`, `/pilot`, `/corporations`, `/individuals`, `/sitemap.xml`

App shell (new — port from `frontend/src/`):
- `/login` — email/pw + magic link + Google + Facebook (mirrors `AuthPage.tsx`)
- `/signup` — new (repo uses `/login` for both; we'll split)
- `/auth/callback` — OAuth landing
- `/demo` — QR-gated demo scenario preview (mirrors demo flow)
- `/workspace` — scenario picker + guided questionnaire + simulation runner
- `/workspace/results/$runId` — RouteFlowChart, ComparisonTable, evidence panel, PDF export
- `/pricing` — plan tiers + upgrade CTA (mirrors `PricingPage`)
- `/account` — profile, avatar upload, run history, subscription, GDPR export/delete (mirrors `AccountPage`)
- `/assistant` — chat UI wired to backend assistant endpoint

Protected routes live under `_authenticated/` layout with a guard that redirects to `/login`.

## Design system continuity

- Everything uses the locked Scientific Ledger tokens: navy `#052347`, teal `#14b8a6`, ghost `#f4f6fa`, Libre Baskerville / IBM Plex Sans / IBM Plex Mono.
- Audience accents remain per-marketing-page.
- App shell (workspace, results, account) gets its own subtle chrome variant: navy sidebar, white canvas, teal action color — still the same tokens, just denser.
- Data viz (RouteFlowChart, MathProofTable, PlotlyChart) restyled with tokens instead of default Plotly palette.

## Phased build (proposed)

Phase A — API client + auth (foundation, ~1 build session)
- `src/lib/api.ts`: typed fetch client with `VITE_API_BASE_URL`, credentials, CSRF handling
- `src/lib/auth/`: session hook (`useSession`) reading from backend, `_authenticated` layout guard
- `/login`, `/signup`, `/auth/callback` routes, real Google + Facebook buttons hitting `/api/oauth/*`
- Magic link redemption route

Phase B — Workspace + results (the product core)
- `/workspace` scenario picker + guided questionnaire (port `ScenarioGuidedQuestionnaire`)
- Simulation submit → results route
- `RouteFlowChart`, `RouteComparisonTable`, `LegalEvidencePanel`, `MathProofTable` restyled
- PDF export button (reuse `advisorPdfExport.ts`)

Phase C — Account + pricing + paywall
- `/account`: profile, avatar upload, run history, subscription, GDPR
- `/pricing` + gating banners + upgrade CTA source tracking

Phase D — Assistant chat + demo QR
- `/assistant` chat UI wired to backend
- `/demo` QR-redeem flow

Phase E — Docs surface (from `.tex` + `.md`)
- `/docs` or `/whitepaper` route rendering `WhitePaper.tex` + `Tech_Sprint_Documentation.tex` (converted MD or PDF hosted)
- Optional; can defer if fundraise timeline is tight

Phase F — Cutover
- Set `VITE_API_BASE_URL` to prod Render host
- Build → the resulting `dist/` replaces `frontend/dist/` on Render
- Update `render.yaml` static path if needed
- DNS stays on `taxsailor.com`

Each phase merges to GitHub via the existing Lovable ↔ GitHub sync on this project's own repo, not the TaxSailor monorepo. **Handoff option**: at the end I emit a PR-shaped diff you copy into the TaxSailor repo, replacing `frontend/`.

## Technical notes

- **CORS**: FastAPI's `cors.py` will need the Lovable preview origin added (for dev). Prod is same-origin under Render.
- **Auth cookies**: backend sets `httpOnly` session cookies; frontend uses `credentials: "include"`. No token storage in JS.
- **OAuth redirect URIs**: register the Lovable preview URL as an allowed redirect in Google + Facebook consoles for staging.
- **File uploads** (avatar, evidence PDFs): multipart POST to `/api/account/avatar` — no Lovable storage buckets needed.
- **PDF export**: existing `advisorPdfExport.ts` uses jsPDF client-side; portable as-is.
- **Framework mismatch**: source is Vite + react-router-dom; target is TanStack Start (SSR + file routing). We port components 1:1 but rewrite routing.
- **Testing**: repo has extensive `*.test.ts` files. We don't port those in this pass; they belong to the monorepo's Vitest runner. We spot-check with Playwright screenshots during build.

## Open questions before Phase A

1. **Lead capture**: keep the Lovable Cloud `leads` table for marketing forms, or point marketing forms at `/api/leads` on Render so all leads land in one DB? (Recommend: point everything at `/api/leads`.)
2. **OAuth in staging**: do you want me to wire Google + Facebook to hit the Render prod backend from the Lovable preview (needs redirect URIs added), or mock auth in preview and only wire real OAuth after cutover?
3. **Cutover mechanism**: do you want the new frontend to fully replace `frontend/` in the TaxSailor monorepo (I emit a diff you PR), or run side-by-side on a subdomain like `app.taxsailor.com` while you A/B?
4. **Docs page**: build `/whitepaper` from `WhitePaper.tex` in this pass, or defer until after fundraise?
5. **Scope trim**: if 6 weeks feels long, which phase can we cut or defer? (My vote: defer Phase E docs and Phase D assistant chat — do A/B/C only for a fundraise-ready cutover.)

## Out of scope this plan

- No backend changes (FastAPI, Dijkstra engine, treaty data).
- No Lovable Cloud Postgres migration of user data.
- No new tax logic, no new jurisdictions.
- No mobile app.
- No CI/CD pipeline changes on Render.
