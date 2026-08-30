// Temporary transport check for the backend proxy. Safe: unauthenticated GET only.
import { createFileRoute } from "@tanstack/react-router";
import { backendProxy } from "@/lib/api-proxy.functions";

export const Route = createFileRoute("/api/proxy-test")({
  server: {
    handlers: {
      GET: async () => {
        const res = await backendProxy({ data: { method: "GET", path: "/health" } });
        return new Response(JSON.stringify(res), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
