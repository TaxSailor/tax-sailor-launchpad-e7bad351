// Server-side proxy to the TaxSailor FastAPI backend.
//
// Why a proxy: the backend's CORS allowlist only covers the taxsailor.com
// origins. Browser calls from the Lovable preview (a lovable.app origin)
// are blocked. By routing every backend call through these server functions
// the request becomes server-to-server, where CORS does not apply, and the
// same code path works unchanged in production.
//
// The browser sends the caller's bearer token; the proxy forwards it as
// Authorization: Bearer. The proxy adds no auth of its own and grants no
// privileges the caller did not already have.
//
// Paths arrive WITHOUT the /api prefix (e.g. "/auth/me"); the transport
// prepends "/api" to match the production mount.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { ProxyResult } from "@/lib/api-types";

export type { ProxyResult } from "@/lib/api-types";

const inputSchema = z.object({
  method: z.enum(["GET", "POST", "PATCH", "PUT", "DELETE"]),
  path: z.string().startsWith("/"),
  body: z.unknown().optional(),
  token: z.string().optional(),
});

const uploadSchema = z.object({
  path: z.string().startsWith("/"),
  filename: z.string().min(1).max(200),
  contentType: z.string().min(3).max(120),
  base64: z.string().min(1).max(8_000_000),
  token: z.string().optional(),
});

export const backendProxy = createServerFn({ method: "POST" })
  .inputValidator((raw) => inputSchema.parse(raw))
  .handler(async ({ data }): Promise<ProxyResult> => {
    const { callBackend } = await import("@/lib/backend.server");
    return callBackend(data);
  });

export const backendUpload = createServerFn({ method: "POST" })
  .inputValidator((raw) => uploadSchema.parse(raw))
  .handler(async ({ data }): Promise<ProxyResult> => {
    const { uploadToBackend } = await import("@/lib/backend.server");
    return uploadToBackend(data);
  });
