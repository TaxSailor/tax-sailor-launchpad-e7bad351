// Server-side proxy to the TaxSailor FastAPI backend.
//
// Why a proxy: the backend's CORS allowlist only covers the taxsailor.com
// origins. Browser calls from the Lovable preview (a lovable.app origin)
// are blocked. By routing every backend call through this server function
// we make the request server-to-server, where CORS does not apply, and the
// same code path works unchanged in production.
//
// The browser sends the caller's bearer token; the proxy forwards it as
// Authorization: Bearer. The proxy adds no auth of its own and grants no
// privileges the caller did not already have — the backend still enforces
// every entitlement gate.
//
// Paths arrive WITHOUT the /api prefix (e.g. "/auth/me"); the proxy prepends
// "/api" to match the production mount in production_app.py.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const BACKEND_URL =
  (process.env.TAXSAILOR_API_BASE ?? "https://www.taxsailor.com").replace(/\/+$/, "");

const inputSchema = z.object({
  method: z.enum(["GET", "POST", "PATCH", "PUT", "DELETE"]),
  path: z.string().startsWith("/"),
  body: z.unknown().optional(),
  token: z.string().optional(),
});

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

export type ProxyResult = {
  ok: boolean;
  status: number;
  body: Json;
};

export const backendProxy = createServerFn({ method: "POST" })
  .inputValidator((raw) => inputSchema.parse(raw))
  .handler(async ({ data }): Promise<ProxyResult> => {
    const url = `${BACKEND_URL}/api${data.path}`;
    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    let bodyStr: string | undefined;
    if (data.body !== undefined && data.method !== "GET" && data.method !== "DELETE") {
      headers["Content-Type"] = "application/json";
      bodyStr = JSON.stringify(data.body);
    }
    if (data.token) headers["Authorization"] = `Bearer ${data.token}`;

    let res: Response;
    try {
      res = await fetch(url, {
        method: data.method,
        headers,
        body: bodyStr,
        redirect: "manual",
      });
    } catch (err) {
      return {
        ok: false,
        status: 502,
        body: { detail: `Backend unreachable: ${err instanceof Error ? err.message : "network error"}` },
      };
    }

    const text = await res.text();
    let parsed: Json = null;
    if (text) {
      try {
        parsed = JSON.parse(text) as Json;
      } catch {
        parsed = text;
      }
    }
    return { ok: res.ok, status: res.status, body: parsed };
  });
