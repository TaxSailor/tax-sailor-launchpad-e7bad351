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
};

async function submitLead(payload: LeadPayload) {
  // FastAPI backend: POST /api/leads/pricing (see src/api/routers/leads.py).
  // We pass audience as the tier_id so sales sees which surface it came from.
  return api.post<{ id: string; created_at: string }>(
    "/api/leads/pricing",
    {
      name: payload.name,
      email: payload.email,
      company: payload.company || undefined,
      tier_id: payload.audience,
      message: payload.message || `Lead from ${payload.source_path ?? "unknown"}`,
    },
    { mock: () => ({ id: `mock-${Date.now()}`, created_at: new Date().toISOString() }) },
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
          maxLength={200}
          className="rounded-sm border border-navy/10 bg-white px-3 py-2.5 text-sm font-mono focus:border-teal focus:outline-none"
        />
      </label>
      <label className="grid gap-1.5">
        <span className="text-[11px] font-medium uppercase tracking-widest text-navy/60">Message (optional)</span>
        <textarea
          name="message"
          rows={3}
          maxLength={5000}
          className="rounded-sm border border-navy/10 bg-white px-3 py-2.5 text-sm focus:border-teal focus:outline-none"
        />
      </label>
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
