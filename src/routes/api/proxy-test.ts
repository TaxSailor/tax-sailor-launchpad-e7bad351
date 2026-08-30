import { createFileRoute } from "@tanstack/react-router";
import { backendProxy } from "@/lib/api-proxy.functions";

export const Route = createFileRoute("/api/proxy-test")({
  server: {
    handlers: {
      GET: async () => {
        const health = await backendProxy({ data: { method: "GET", path: "/health" } });
        const jurisdictions = await backendProxy({ data: { method: "GET", path: "/jurisdictions" } });
        return Response.json({
          health_status: health.status,
          health_ok: health.ok,
          health_version: (health.body as { version?: string })?.version,
          jurisdictions_status: jurisdictions.status,
          jurisdictions_ok: jurisdictions.ok,
          jurisdictions_count: Array.isArray((jurisdictions.body as { jurisdictions?: unknown[] })?.jurisdictions)
            ? ((jurisdictions.body as { jurisdictions: unknown[] }).jurisdictions).length
            : Array.isArray(jurisdictions.body)
              ? jurisdictions.body.length
              : "see body",
        });
      },
    },
  },
});
