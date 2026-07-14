// Assistant chat endpoint — proxies to Lovable AI Gateway.
// The client sends the full conversation history each call (models are stateless).
// We keep the system prompt server-side so it can't be tampered with.

import { createFileRoute } from "@tanstack/react-router";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

const SYSTEM_PROMPT = `You are the TaxSailor Assistant — an in-app helper for a startup that builds a Dijkstra-style graph optimizer for cross-border corporate structures and personal tax residency.

Answer clearly and briefly. You are helpful for:
- explaining what TaxSailor does and the four business models (Investors, Pilot, Corporations, Individuals)
- explaining pricing tiers (Consumer, Professional, Premium, Enterprise) at a high level
- guiding users through the workspace (running a simulation, reading results)
- general tax-optimization concepts (holding structures, IP boxes, DTAs, participation exemption, residency)

You are NOT a licensed tax advisor. Add a short disclaimer when a user asks for personal legal or tax advice. Never fabricate citations. When unsure, say so and suggest contacting the TaxSailor team via /contact.

Style: concise, editorial, no filler. Prefer short paragraphs and lists. Use markdown.`;

async function callGateway(messages: ChatMessage[]): Promise<string> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY missing");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
    }),
  });
  const text = await res.text();
  if (!res.ok) {
    if (res.status === 429) throw new Error("Rate limit — try again shortly.");
    if (res.status === 402) throw new Error("AI credits exhausted. Contact the TaxSailor team.");
    throw new Error(`AI gateway ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = JSON.parse(text) as {
    choices: { message: { content: string } }[];
  };
  return data.choices?.[0]?.message?.content ?? "";
}

export const Route = createFileRoute("/api/assistant")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { messages?: ChatMessage[] };
          const messages = Array.isArray(body.messages) ? body.messages : [];
          const filtered = messages
            .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
            .slice(-20);
          if (filtered.length === 0) {
            return Response.json({ error: "No messages provided" }, { status: 400 });
          }
          const reply = await callGateway(filtered);
          return Response.json({ reply });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unknown error";
          return Response.json({ error: message }, { status: 500 });
        }
      },
    },
  },
});
