import { useState, type ReactNode } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { Check } from "lucide-react";

type Audience = "investors" | "pilot" | "corporations" | "individuals" | "general";

type LeadPayload = {
  audience: Audience;
  name: string;
  email: string;
  company?: string;
  message?: string;
  source_path?: string;
  website?: string; // honeypot
};

// Backend accepts tier_id ∈ {consumer, professional, premium, enterprise} or null.
// We map audience → suggested tier where it makes sense; otherwise pass null and
// prefix the message with the audience so sales can route it.
const AUDIENCE_TIER: Record<Audience, string | null> = {
  investors: null,
  pilot: "professional",
  corporations: "enterprise",
  individuals: "consumer",
  general: null,
};

async function submitLead(payload: LeadPayload) {
  const audiencePrefix = `[${payload.audience.toUpperCase()}] `;
  const rawMessage = payload.message?.trim() ?? "";
  const message = rawMessage.length >= 10
    ? `${audiencePrefix}${rawMessage}`
    : `${audiencePrefix}${rawMessage || "Interested in TaxSailor — please reach out."} (from ${payload.source_path ?? "unknown"})`;

  return api.post<{ id: number; created_at: string; message: string }>(
    "/leads/pricing",
    {
      name: payload.name,
      email: payload.email,
      company: payload.company || undefined,
      tier_id: AUDIENCE_TIER[payload.audience] ?? undefined,
      message,
      website: payload.website || undefined,
    },
    { skipAuth: true, mock: () => ({ id: Date.now(), created_at: new Date().toISOString(), message: "Received." }) },
  );
}

const audienceCopy: Record<Audience, { title: string; description: string; cta: string }> = {
  investors: {
    title: "Book an investor call",
    description: "We share our data room, thesis, and traction with qualified investors and connectors.",
    cta: "Request the deck",
  },
  pilot: {
    title: "Request pilot access",
    description: "30-day free pilot for 5–10 DACH boutique advisory firms. Q3 2026 cohort.",
    cta: "Apply for the pilot",
  },
  corporations: {
    title: "Book a demo",
    description: "Discuss WHT, Pillar Two, and transfer pricing use cases for your group.",
    cta: "Request a demo",
  },
  individuals: {
    title: "Get started",
    description: "Cross-border residency, §6/§2 AStG, and ErbStG scenarios. We'll be in touch.",
    cta: "Request access",
  },
  general: {
    title: "Access the platform",
    description: "Tell us who you are — we route your request to the right team.",
    cta: "Send",
  },
};

export function LeadForm({ audience, onSuccess }: { audience: Audience; onSuccess?: () => void }) {
  const copy = audienceCopy[audience];
  const [done, setDone] = useState(false);
  const mutation = useMutation({
    mutationFn: submitLead,
    onSuccess: () => {
      setDone(true);
      onSuccess?.();
    },
  });

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="grid size-12 place-items-center rounded-full bg-teal/15 text-teal">
          <Check className="size-6" />
        </div>
        <p className="font-serif text-xl text-navy">Received.</p>
        <p className="max-w-sm text-sm text-navy/60">
          We'll reach out shortly. In the meantime, feel free to reply directly to any confirmation you receive.
        </p>
      </div>
    );
  }

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        mutation.mutate({
          audience,
          name: String(f.get("name") ?? ""),
          email: String(f.get("email") ?? ""),
          company: String(f.get("company") ?? ""),
          message: String(f.get("message") ?? ""),
          website: String(f.get("website") ?? ""),
          source_path: typeof window !== "undefined" ? window.location.pathname : undefined,
        });
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-widest text-navy/60">Name</span>
          <input
            name="name"
            required
            minLength={2}
            maxLength={120}
            className="rounded-sm border border-navy/10 bg-white px-3 py-2.5 text-sm font-mono focus:border-teal focus:outline-none"
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-widest text-navy/60">Email</span>
          <input
            name="email"
            type="email"
            required
            maxLength={255}
            className="rounded-sm border border-navy/10 bg-white px-3 py-2.5 text-sm font-mono focus:border-teal focus:outline-none"
          />
        </label>
      </div>
      <label className="grid gap-1.5">
        <span className="text-[11px] font-medium uppercase tracking-widest text-navy/60">Company / Firm</span>
        <input
          name="company"
          maxLength={120}
          className="rounded-sm border border-navy/10 bg-white px-3 py-2.5 text-sm font-mono focus:border-teal focus:outline-none"
        />
      </label>
      <label className="grid gap-1.5">
        <span className="text-[11px] font-medium uppercase tracking-widest text-navy/60">Message</span>
        <textarea
          name="message"
          rows={3}
          maxLength={4000}
          placeholder="A sentence or two on what you're looking for…"
          className="rounded-sm border border-navy/10 bg-white px-3 py-2.5 text-sm focus:border-teal focus:outline-none"
        />
      </label>
      {/* Honeypot: bots fill it, humans don't see it. */}
      <input
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />
      {mutation.isError && (
        <p className="text-sm text-destructive">
          {mutation.error instanceof Error ? mutation.error.message : "Something went wrong."}
        </p>
      )}
      <button
        type="submit"
        disabled={mutation.isPending}
        className="mt-2 inline-flex items-center justify-center rounded-sm bg-navy px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-teal disabled:opacity-60"
      >
        {mutation.isPending ? "Sending…" : copy.cta}
      </button>
    </form>
  );
}

export function LeadDialog({
  audience,
  trigger,
}: {
  audience: Audience;
  trigger: ReactNode;
}) {
  const copy = audienceCopy[audience];
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-navy">{copy.title}</DialogTitle>
          <DialogDescription className="text-navy/60">{copy.description}</DialogDescription>
        </DialogHeader>
        <LeadForm audience={audience} />
      </DialogContent>
    </Dialog>
  );
}
