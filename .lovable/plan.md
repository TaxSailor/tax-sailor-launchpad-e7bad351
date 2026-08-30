# W2 — Complete the product surface in the new design

Goal for today's track: every page the old app had exists in the new TaxSailor design, wired to the live backend, so we can then go page by page and refine. The landing page is final and will not be touched.

## What the repository scan found

Backend (FastAPI, deployed on Render, no `/api` prefix):

- Auth: `/auth/*` (login, register, magic link, password reset, session), OAuth at `/auth/oauth/*` (Google, Facebook, account linking).
- Account: `/account/*` (profile, subscription, saved runs, avatar, GDPR export and deletion, settings).
- Engine: `/simulate`, `/simulate/top-paths`, `/simulate/export/cbcr`, `/simulate/export/gir`, `/jurisdictions`, `/graph/summary`, `/ui/conditions`.
- Evidence: `/documents/summary`, `/documents/route-sources`, `/documents/route-citations`.
- Assistant: `/ui/chat`. Leads: `/leads/*`. Analytics: `/event/*`.
- Entitlement and gating middleware shapes every response, so tier gating is server-driven, not a frontend guess.

Old frontend (React SPA, six top-level routes): `/`, `/demo`, `/workspace`, `/pricing`, `/account`, `/login`, plus QR and magic-link entry params. Behind those six routes sit the surfaces that actually matter and that our new site does not have yet:

- Workspace entry fork (guide me with AI vs choose manually), scenario tiles, two-step scenario setup, search mode picker, flow stepper, decision tree, structure diagram.
- Route briefing results: route flow chart, math proof table, result panels, technical details, best destinations, how to read results, coverage and disclaimer notices.
- Evidence layer: legal evidence panel, citation cards, document snippet excerpts, source pending and empty states, copy evidence.
- Gating layer: locked teasers, blur reveal, citation teasers, paywall unlock CTA, upgrade notices.
- Assistant: chat panel with starter prompts, workspace and results handoff, deep links, retry cooldown, gating banner.
- Account: profile, security, subscription, history with saved run editor, avatar upload, personalisation and theme, danger zone (GDPR export and delete).
- Demo page: QR panel, demo corridor, one-run proof view.
- Auth: login, register, magic link, password reset, OAuth buttons, re-auth, session expiry.

Our new site currently has landing, four audience pages, pricing, docs, about, contact, login, signup, OAuth callback, workspace index, scenario, results, account, admin. So the shells exist; the depth behind workspace, results, account, evidence, gating, assistant, and demo does not.

## Working rules for this run

- Batches are sized so each one ends with a green typecheck and a written progress note in `.lovable/progress-w2.md` (routes done, wiring done, what is next). If a batch is interrupted, the next run resumes from that file, so context is never lost.
- I report an estimated and actual size at the start and end of each batch, and pause before the batch that would push us near the limit. On pause you get: what is done, what is left, and the exact sentence to send to continue (same chat, or a new chat if the history has grown too long, in which case the progress file is the handoff).
- Copy rules applied everywhere: no AI phrasing, no filler, no em or en dashes, plain professional English, short sentences.
- Design rules: reuse the existing tokens and Scientific Ledger and Maison editorial patterns from the landing page. Every page responsive from 360px to ultrawide, keyboard reachable, visible focus, real empty, loading, error, gated, and unsupported states.
- Backend: `VITE_API_BASE_URL` points at the live Render service, and each batch verifies its own paths against the deployed API before I call it done.

## Batches

**Batch 0 — Contract lock and inventory (small)**
Pull the exact request and response models from `src/data/schemas*.py` and the router signatures into a single local contract file. Point the client at the live Render base URL and verify `/health`, `/jurisdictions`, `/graph/summary`, `/auth/login`, `/simulate` respond as typed. Output: contract notes plus a route inventory table mapping every old surface to a new route.

**Batch 1 — Workspace entry and scenario setup**
Entry fork, scenario tiles for the six golden scenarios, two-step setup with the guided questionnaire, search mode picker, flow stepper, scenario context and preamble. Wired to `/jurisdictions` and `/ui/conditions`. Persistence, deep links, and QR and magic-link entry params preserved.

**Batch 2 — Route briefing and results**
Results page rebuilt as an executive route briefing: route flow chart, retained percentage bands, math proof table, result panels, technical details, best destinations, coverage notice, disclaimer, CbCR and GIR exports. Wired to `/simulate`, `/simulate/top-paths`, `/simulate/export/*`.

**Batch 3 — Evidence and gating**
Legal evidence panel, citation cards, snippet excerpts with source pending and empty states, copy evidence. Gating layer driven by the server entitlement fields: locked teasers, blur reveal, citation teasers, paywall CTA into `/pricing`. Wired to `/documents/*`.

**Batch 4 — Account and auth depth**
Account shell with profile, security, subscription, history plus saved run editor, avatar upload, personalisation and theme, danger zone with GDPR export and delete. Auth completed: register, magic link, password reset, re-auth, session expiry handling, Google and Facebook OAuth against `/auth/oauth/*`.

**Batch 5 — Demo page and assistant**
`/demo` as the one-run proof surface with QR panel and demo corridor. Assistant panel with starter prompts, workspace and results handoff, deep links, retry cooldown, gating banner, wired to `/ui/chat`. Analytics events to `/event/*`.

**Batch 6 — Sweep, performance, publish prep**
Link audit across every route, head metadata per page, sitemap update, image and bundle pass, Lighthouse-style check on mobile and desktop, then the smoke checklist for production. After that you flip the repo back to private.

## Technical notes

- Routes are added under `src/routes/`, authenticated surfaces under `src/routes/_authenticated/`, one file per URL, `createFileRoute` strings matching filenames.
- Old URLs stay valid: `/demo`, `/workspace`, `/pricing`, `/account`, `/login` keep their paths so existing links and QR codes do not break.
- Server-driven gating: entitlement fields from the API decide what is locked. The frontend never decides tier access on its own.
- Shared logic ported into `src/lib/workspace/`, `src/lib/evidence/`, `src/lib/gating/`, `src/lib/account/`, keeping the naming from the old modules so future syncs are readable.
- Admin console stays on mock data until backend admin endpoints exist. I will flag it rather than fake it.

## What I need from you

- Keep the repo public until Batch 0 finishes. I will tell you the moment it is safe to flip back.
- The Render base URL for the deployed backend, and a test account (email and password) so I can verify authenticated paths end to end. If OAuth is configured for the production domain only, say so and I will verify the password path instead.
