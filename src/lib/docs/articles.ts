export type DocCategory = "Product" | "Method" | "Trust" | "Company";

export interface Article {
  slug: string;
  title: string;
  summary: string;
  category: DocCategory;
  readingMinutes: number;
  body: string;
}

export const categories: { name: DocCategory; description: string }[] = [
  { name: "Product", description: "How the workspace, assistant, and account features work." },
  { name: "Method", description: "The algorithm, data sources, and correctness proofs." },
  { name: "Trust", description: "Security, privacy, and compliance posture." },
  { name: "Company", description: "About TaxSailor and how we work with clients." },
];

export const articles: Article[] = [
  {
    slug: "how-taxsailor-works",
    title: "How TaxSailor works",
    summary: "A one-page overview of the graph engine, from jurisdictions to a ranked route.",
    category: "Method",
    readingMinutes: 4,
    body: `## The problem

Cross-border capital passes through multiple tax regimes. A single transaction can be legal, optimal, and completely misunderstood — because the interaction between treaties, withholding, and residency rules is combinatorial.

## The model

TaxSailor represents every jurisdiction as a **node** and every treaty relationship as a **weighted edge**. Weights encode effective rates after credits, exemptions, and anti-abuse tests. The optimizer runs a **log-transformed Dijkstra** so multiplicative retention becomes additive cost — mathematically identical, numerically stable.

## Inputs

- **Origin** — where value is generated
- **Destination** — where the beneficial owner is resident
- **Amount and instrument** — dividend, interest, royalty, capital gains, or salary

## Outputs

- The **optimal** legal route with intermediate structures and effective ETR
- A **baseline** direct route for comparison
- **Citations** — treaty article, domestic code, and effective date
- **Deltas** — savings vs. baseline, in currency and basis points

## What it is not

TaxSailor is decision support, not advice. Every route carries citations so a tax practitioner can validate it. The engine is deterministic — the same inputs always return the same route with the same trace.`,
  },
  {
    slug: "six-scenarios",
    title: "The six core scenarios",
    summary: "The corridors we optimize today, and how they map to your situation.",
    category: "Product",
    readingMinutes: 3,
    body: `TaxSailor's engine is general, but we ship six **golden corridors** — validated end to end and used in the guided workspace.

1. **Dividend repatriation** — from operating subsidiary to holding parent
2. **Interest flows** — intercompany or third-party debt
3. **Royalties & IP** — licensing across jurisdictions
4. **Capital gains** — on the sale of shares or assets
5. **Employment income** — for founders, executives, and mobile talent
6. **Digital-nomad residency** — for individuals with location-independent income

Each scenario collects the minimum inputs required (origin, destination, amount, instrument details) and returns a ranked route with citations. If your situation does not fit one of the six, [contact us](/contact) — the engine can be extended, and pilot clients help shape which corridor ships next.`,
  },
  {
    slug: "data-sources-and-citations",
    title: "Data sources and citations",
    summary: "3,000+ documents, versioned by jurisdiction and effective date.",
    category: "Method",
    readingMinutes: 3,
    body: `Every rate on the graph is backed by a primary source. We do not paraphrase — we cite.

## What is in the corpus

- **Bilateral tax treaties** — full text, with articles, protocols, and MLI positions
- **Domestic tax codes** — statutory rates for withholding, corporate income, capital gains
- **Administrative guidance** — where it materially affects treatment
- **EU directives** — Parent-Subsidiary, Interest-Royalties, ATAD

## Versioning

Every rule is scoped to an **effective date range**. A simulation dated *today* uses the rules in force today; a historic simulation reproduces the graph as it was.

## Citations in results

Every simulation result includes citations you can hand to a tax practitioner: article, paragraph, and effective date. If a citation is missing, that edge is missing — we refuse to guess.`,
  },
  {
    slug: "workspace-guide",
    title: "Workspace guide",
    summary: "From picking a scenario to reading the route trace.",
    category: "Product",
    readingMinutes: 4,
    body: `## 1. Pick a scenario

The workspace opens on the six-scenario picker. Each card shows the required inputs and typical output — pick the one closest to your situation.

## 2. Answer the questions

Every scenario has three to five inputs: origin, destination, amount, and instrument-specific fields. Fields are validated inline; no data leaves your browser until you submit.

## 3. Read the results

The results page shows two cards:

- **Optimal route** — the ranked legal path with effective ETR
- **Baseline** — direct route, for comparison

Below the cards, a **trace** panel lists every edge on the optimal path, with citations. Save the run to your account to return to it later; upgrade to Professional to export a PDF brief.

## 4. Ask the assistant

The floating assistant is aware of your active run. Ask it to explain any citation, translate a treaty article into plain English, or compare two scenarios.`,
  },
  {
    slug: "assistant-guide",
    title: "Assistant guide",
    summary: "What the TaxSailor Assistant can and cannot do.",
    category: "Product",
    readingMinutes: 2,
    body: `The Assistant is a chat interface grounded in the TaxSailor corpus and your active workspace state.

## Good questions

- *"Explain the withholding rate on this edge."*
- *"What is the substance requirement in the DE-NL treaty?"*
- *"Compare a Cyprus holdco vs. a Dutch holdco for this dividend flow."*
- *"Summarize the citations in plain English for a founder."*

## Limits

- The Assistant does **not** give tax advice. It surfaces the corpus and explains routes.
- It will not fabricate citations. If a rule is not in the corpus, it will say so.
- Conversations are scoped to your account and are used only to improve retrieval — not shared.

## Rate limits

Free and Consumer tiers share a modest per-day quota. Professional and above have generous limits. If you hit a limit, upgrade at [/pricing](/pricing).`,
  },
  {
    slug: "accounts-and-billing",
    title: "Accounts and billing",
    summary: "Tiers, usage, and how invoicing works.",
    category: "Product",
    readingMinutes: 3,
    body: `TaxSailor uses four tiers — **Consumer**, **Professional**, **Premium**, and **Enterprise**. See [pricing](/pricing) for the current amounts.

## Usage

Every simulation counts as one run. The account page shows your monthly usage against your tier's quota. Runs are never deleted — they stay in your history even after a downgrade, but new runs are blocked once you hit the cap.

## Billing

Consumer and Professional are self-serve. Premium and Enterprise are contract-based — reach out via [contact](/contact) and we will scope a pilot. Invoices are issued in EUR; VAT is applied per your billing address.

## Cancellation and export

You can cancel any self-serve plan from the account page. On cancellation, your data remains readable for 30 days and can be exported as JSON or CSV at any time.`,
  },
  {
    slug: "security-and-privacy",
    title: "Security & privacy",
    summary: "How we handle authentication, data, and secrets.",
    category: "Trust",
    readingMinutes: 3,
    body: `## Authentication

TaxSailor supports email/password and Google OAuth. Sessions are HTTP-only, rotated on refresh, and revocable from the account page. There is no anonymous sign-up.

## Data at rest

Simulation inputs and outputs are stored per-account and scoped by row-level security. Only you and the accounts you explicitly share with can read your runs.

## Data in transit

All traffic is TLS 1.2+. The Assistant proxy strips headers before forwarding to the model provider.

## Secrets

API keys and service credentials are stored server-side only. The client never sees a provider token. Webhook endpoints verify signatures with constant-time comparison before processing any payload.

## Responsible disclosure

Found a vulnerability? Write to security@taxsailor.com — we respond within one business day.`,
  },
  {
    slug: "correctness-and-audit",
    title: "Correctness & audit",
    summary: "How we test the engine and what a proof trace looks like.",
    category: "Method",
    readingMinutes: 3,
    body: `## Test surface

The engine ships with a golden test suite covering the six corridors, each with hand-computed expected outputs. Every rate, treaty, and edge weight is unit-tested; every route is regression-tested.

## Proof traces

Every simulation emits a **proof trace** — the ordered list of edges, the rule cited on each edge, and the arithmetic that produced the effective rate. Traces are deterministic and reproducible from inputs + engine version.

## Reconciliation

Live numbers in the pitch and the marketing site are reconciled against the engine on every release. Discrepancies fail the build.

## Independent review

Pilot clients get access to raw traces and are encouraged to have a tax practitioner validate them. We treat every flagged discrepancy as a P0.`,
  },
  {
    slug: "for-investors",
    title: "For investors",
    summary: "What we are building, why now, and what the pilot proves.",
    category: "Company",
    readingMinutes: 3,
    body: `TaxSailor is building the graph layer for cross-border tax. The market is large, fragmented, and served today by manual advisory — high cost, slow turnaround, opaque reasoning.

## What is different

- **Deterministic engine.** Same inputs, same route, every time — with citations.
- **Corpus depth.** 3,000+ documents, versioned. Extending to a new corridor is a data problem, not a modeling problem.
- **Right team.** Founders combine tax practice, systems engineering, and cross-border capital.

## Pilot thesis

Ten pilot clients across our four segments (investors, corporations, mobile individuals, digital nomads) validate three things: routes match practitioner recommendations, savings are material, and workflow beats status quo.

## What we are raising

A pre-seed round to run the pilot, extend the corpus, and hire our first two engineers. See [/investors](/investors) for the data room request.`,
  },
];

export function getArticle(slug: string) {
  return articles.find((a) => a.slug === slug);
}

export function getAdjacent(slug: string) {
  const idx = articles.findIndex((a) => a.slug === slug);
  if (idx === -1) return { prev: undefined, next: undefined };
  return {
    prev: idx > 0 ? articles[idx - 1] : undefined,
    next: idx < articles.length - 1 ? articles[idx + 1] : undefined,
  };
}
