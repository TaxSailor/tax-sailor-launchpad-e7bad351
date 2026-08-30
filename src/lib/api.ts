// Typed client for the TaxSailor FastAPI backend.
//
// All requests route through the backendProxy server function
// (src/lib/api-proxy.functions.ts). That proxy runs server-to-server so the
// backend's CORS allowlist (taxsailor.com only) never blocks preview calls,
// and the same path works unchanged in production.
//
// Paths use the plain backend contract WITHOUT the /api prefix:
//   /auth/me, /simulate, /account/profile, /leads/pricing, /ui/chat, ...
// The proxy prepends /api to match the production mount in production_app.py.

import { backendProxy, type ProxyResult } from "@/lib/api-proxy.functions";

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

type Json = Record<string, unknown> | Array<unknown>;

async function getAuthToken(): Promise<string | null> {
  try {
    const { getAuthToken: t } = await import("@/lib/auth/session");
    return t();
  } catch {
    return null;
  }
}

function raiseIfNotOk(result: ProxyResult, path: string): void {
  if (result.ok) return;
  let msg = `HTTP ${result.status}`;
  const body = result.body;
  if (body && typeof body === "object" && !Array.isArray(body)) {
    const detail = (body as { detail?: unknown }).detail;
    if (typeof detail === "string") msg = detail;
    else if (Array.isArray(detail) && detail[0] && typeof detail[0] === "object" && "msg" in (detail[0] as object))
      msg = String((detail[0] as { msg: unknown }).msg);
    else if (detail && typeof detail === "object" && "message" in (detail as object))
      msg = String((detail as { message: unknown }).message);
  }
  throw new ApiError(msg, result.status, body);
}

type CallOpts = { skipAuth?: boolean; mock?: () => unknown };

async function apiFetch<T>(
  path: string,
  init: RequestInit & CallOpts = {},
): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase() as "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  const token = init.skipAuth ? null : await getAuthToken();
  let body: unknown;
  if (init.body !== undefined && method !== "GET" && method !== "DELETE") {
    body = typeof init.body === "string" ? JSON.parse(init.body) : init.body;
  }
  const result = await backendProxy({ data: { method, path, body, token: token ?? undefined } });
  raiseIfNotOk(result, path);
  return result.body as T;
}

export const api = {
  get: <T>(path: string, opts: CallOpts = {}) =>
    apiFetch<T>(path, { method: "GET", ...opts }),
  post: <T>(path: string, data?: Json | FormData, opts: CallOpts = {}) =>
    apiFetch<T>(path, {
      method: "POST",
      body: data instanceof FormData ? data : data !== undefined ? JSON.stringify(data) : undefined,
      ...opts,
    }),
  patch: <T>(path: string, data?: Json, opts: CallOpts = {}) =>
    apiFetch<T>(path, { method: "PATCH", body: data !== undefined ? JSON.stringify(data) : undefined, ...opts }),
  del: <T>(path: string, opts: CallOpts = {}) =>
    apiFetch<T>(path, { method: "DELETE", ...opts }),
};

// Kept for legacy import sites that still reference IS_MOCK_API / API_BASE_URL.
export const IS_MOCK_API = false;
export const API_BASE_URL = "";
