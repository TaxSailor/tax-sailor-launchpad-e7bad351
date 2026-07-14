import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const leadSchema = z.object({
  audience: z.enum(["investors", "pilot", "corporations", "individuals", "general"]),
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  company: z.string().trim().max(200).optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
  message: z.string().trim().max(5000).optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
  source_path: z.string().trim().max(200).optional(),
});

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => leadSchema.parse(data))
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
    const supabase = createClient(process.env.SUPABASE_URL!, key, {
      auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
          h.set("apikey", key);
          return fetch(input as RequestInfo, { ...init, headers: h });
        },
      },
    });
    const { error } = await supabase.from("leads").insert({
      audience: data.audience,
      name: data.name,
      email: data.email,
      company: data.company ?? null,
      message: data.message ?? null,
      source_path: data.source_path ?? null,
    });
    if (error) {
      console.error("[leads] insert failed", error);
      throw new Error("Could not submit — please try again.");
    }
    return { ok: true as const };
  });
