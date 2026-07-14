
Implement the "Scientific Ledger" direction as the full TaxSailor site. Locked tokens: navy `#052347`, teal `#14b8a6`, ghost `#f4f6fa`, white; Libre Baskerville (serif headlines), IBM Plex Sans (body), IBM Plex Mono (numbers, equations, meta). Full-width stacked bands, editorial spacing, no dark AI-slop gradients.

## 1. Design tokens & fonts

- Update `src/styles.css`: replace shadcn light tokens with navy/teal/ghost palette in oklch; register `--font-serif`, `--font-sans`, `--font-mono`; keep dark-mode block but off by default (site is light-only).
- Load Libre Baskerville + IBM Plex Sans + IBM Plex Mono via `<link>` tags in `src/routes/__root.tsx` head (never `@import` in styles.css).
- Add audience accent tokens: `--accent-investors` (teal), `--accent-pilot` (emerald `#10b981`), `--accent-corporations` (steel `#64748b`), `--accent-individuals` (amber `#c9822a`).

## 2. Shared shell

- `src/components/site/Nav.tsx` — sticky, blurred, TaxSailor sail-icon logo (inline SVG derived from uploaded logo), links: Technology / Audience / Roadmap / About / Contact + primary CTA "Access Platform".
- `src/components/site/Footer.tsx` — matches direction footer.
- `src/components/site/Logo.tsx` — reusable inline SVG mark (navy fill, teal accent).
- `src/components/site/RouteGraph.tsx` — animated SVG route-graph (nodes lighting up sequentially) used in hero. Pure CSS/SVG animation, no framer-motion needed for this piece.
- `src/components/site/StatBar.tsx` — 131 / 438 / 3,000+ / 50+ trust bar; scroll-triggered count-up via `IntersectionObserver` + `requestAnimationFrame`.
- Wrap `<Outlet />` in `src/routes/__root.tsx` with the nav + footer so every page shares them.

## 3. Homepage (`/`)

Rebuild `src/routes/index.tsx` matching Scientific Ledger composition exactly:
Hero (split 50/50, headline left + route-graph right) → navy trust bar → audience router (4 cards, `bg-navy/10` hairline separators) → Algorithmic Kernel band (equation W = −ln(1 − τ) in navy panel) → Roadmap (4 columns, teal border-left on current milestone) → Team (navy background, 4 headshots imported from uploads) → Lead-capture CTA card → footer. Real copy from PDFs/sprint doc.

## 4. Audience subpages (same shell, accent varies)

- `src/routes/investors.tsx` — teal accent. Hero + thesis (€105k→€1.8M projection), traction, ask, "Book investor call" CTA.
- `src/routes/pilot.tsx` — emerald accent. Deliverables, pricing bands €149 / €249 / €499 (IBM Plex Mono), 30-day free pilot, "Request pilot access" form.
- `src/routes/corporations.tsx` — steel accent. Use cases (WHT, Pillar Two, transfer pricing), integration story, "Book demo" CTA.
- `src/routes/individuals.tsx` — amber accent. Personas (§6 AStG, §2 AStG, ErbStG scenarios), calculator teaser, "Get started" CTA.

Each route sets its own `head()` with unique title, description, og:title, og:description, canonical, og:url.

## 5. About + Contact

- `src/routes/about.tsx` — mission, four team headshots (imported from `user-uploads://`), anti-pattern grid ("we are not…"), team bios pulled from sprint doc.
- `src/routes/contact.tsx` — segmented email addresses + one shared form.

## 6. Lead capture wired to Cloud

- Migration: create `public.leads` (id, audience, name, email, company, message, created_at) with grants + RLS. Public insert allowed; select restricted to authenticated admin.
- Server function `submitLead` in `src/lib/leads.functions.ts` — Zod-validates input, inserts via server publishable client, returns `{ok:true}`.
- `src/components/site/LeadForm.tsx` — accepts `audience` prop, uses `useServerFn` + `useMutation`, shows success/error states.
- Replace every "Request pilot / Book call / Book demo" button with a modal opening the `<LeadForm>` scoped to the page's audience. (No email notification wiring in this pass — the leads table is the deliverable; email can be added later via a trigger.)

## 7. Assets

- Copy the 4 team headshots + logo SVG from `user-uploads://` into `src/assets/` as static imports.
- Team photos render grayscale by default, color on hover (matches direction).
- Favicon: replace `public/favicon.ico` — skip in this pass unless quick; keep default.

## 8. SEO plumbing

- Per-route `head()` with title/description/og/canonical (relative paths — no domain yet).
- Root `head()` keeps sitewide defaults; remove "Lovable App" placeholder.
- Add `src/routes/sitemap[.]xml.ts` server route enumerating all 7 routes.
- Add `public/robots.txt` with `Allow: /`.

## 9. Responsive & QA

- All layouts use the grid+`min-w-0`+`shrink-0` pattern for header rows.
- Verify at 375 / 768 / 1024 / 1440 via Playwright screenshots after build; iterate on any clipping.

## 10. Out of scope this pass

- Email-on-submit notification (add later via Cloud trigger or Resend).
- GitHub OAuth: still user-triggered from Plus menu, unchanged.
- OG images: skip until domain is set.

Deliverable: full 7-route responsive site running on locked design tokens with real lead-capture into Cloud.
