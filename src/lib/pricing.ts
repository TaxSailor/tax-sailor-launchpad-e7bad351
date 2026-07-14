// Pricing config ported from the launchpad monorepo (frontend/src/pricing.ts).
// Contact-to-pay only for now — no payment processor. See Phase32_Decisions §4.

export type PricingEntitlementTier = "consumer_paid" | "advisor_pro";
export type PricingTierId = "consumer" | "professional" | "premium" | "enterprise";
export type PricingCadence = "per_report" | "per_month" | "per_package" | "per_year";

export type PricingTier = {
  id: PricingTierId;
  name: string;
  audience: string;
  cadence: PricingCadence;
  priceDisplay: string;
  headline: readonly string[];
  entitlementTier?: PricingEntitlementTier;
  mostPopular?: boolean;
};

export const PRICING_CONTACT_DISPLAY_EMAIL = "sales@taxsailor.com";
export const PRICING_CONTACT_MAILTO_EMAIL = "taxsailor@gmail.com";
export const PRICING_PURCHASE_CTA_LABEL = "Contact us to purchase";

export const PRICING_TIERS: readonly PricingTier[] = [
  {
    id: "consumer",
    name: "Consumer",
    audience: "Creators, nomads, inheritance cases",
    cadence: "per_report",
    priceDisplay: "€99–499",
    headline: [
      "Full optimisation report",
      "Top-20 routes",
      "Risk analysis",
      "Implementation roadmap",
    ],
    entitlementTier: "consumer_paid",
  },
  {
    id: "professional",
    name: "Professional",
    audience: "Tax advisors, law firms, auditors",
    cadence: "per_month",
    priceDisplay: "€199/mo",
    headline: ["Advisor licence", "Unlimited research", "Client reports", "DATEV export (Q4)"],
    entitlementTier: "advisor_pro",
    mostPopular: true,
  },
  {
    id: "premium",
    name: "Premium",
    audience: "Family offices, HNWI, CFOs",
    cadence: "per_package",
    priceDisplay: "€1k–10k",
    headline: [
      "White-glove review",
      "Partner network",
      "Custom modelling",
      "Export-ready deliverables",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    audience: "Accounting and wealth platforms",
    cadence: "per_year",
    priceDisplay: "€5k–100k/yr",
    headline: ["Infrastructure API", "White-label", "SLA", "Custom data feeds"],
  },
] as const;

export function buildPricingMailtoHref(tier?: PricingTier): string {
  const subject = tier
    ? `TaxSailor ${tier.name} — purchase enquiry`
    : "TaxSailor pricing enquiry";
  const body = tier
    ? `Hi TaxSailor team,\n\nI'm interested in the ${tier.name} plan (${tier.priceDisplay}).\n\n`
    : "Hi TaxSailor team,\n\nI would like to discuss pricing.\n\n";
  const params = new URLSearchParams({ subject, body });
  return `mailto:${PRICING_CONTACT_MAILTO_EMAIL}?${params.toString()}`;
}
