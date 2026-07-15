// Typed fetch client for the TaxSailor FastAPI backend.
//
// Base URL comes from VITE_API_BASE_URL (e.g. "https://taxsailor-web.onrender.com").
// When unset, the client runs in MOCK mode using canned fixtures declared at
// each call site.
//
// The FastAPI service does NOT mount its routers under an /api prefix, so
// every path here uses the plain backend contract: /auth/*, /simulate,
// /leads/pricing, /account/*, /ui/chat, /jurisdictions, /documents/*, etc.

export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, "") ?? "";

export const IS_MOCK_API = API_BASE_URL.length === 0;

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

async function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function apiFetch<T>(
  path: string,
  init: RequestInit & { mock?: () => T | Promise<T>; skipAuth?: boolean } = {},
): Promise<T> {
  if (IS_MOCK_API) {
    if (!init.mock) throw new ApiError(`No mock for ${path}`, 501, null);
    await delay(250);
    return init.mock();
  }
  const url = `${API_BASE_URL}${path}`;
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Accept", "application/json");

  if (!init.skipAuth) {
    try {
      const { getAuthToken } = await import("@/lib/auth/session");
      const t = getAuthToken();
      if (t && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${t}`);
    } catch {
      /* noop */
    }
  }

  const res = await fetch(url, { ...init, headers });

  let body: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    if (body && typeof body === "object" && "detail" in body) {
      const d = (body as { detail: unknown }).detail;
      if (typeof d === "string") msg = d;
      else if (Array.isArray(d) && d[0] && typeof d[0] === "object" && "msg" in (d[0] as object))
        msg = String((d[0] as { msg: unknown }).msg);
      else if (d && typeof d === "object" && "message" in (d as object))
        msg = String((d as { message: unknown }).message);
    }
    throw new ApiError(msg, res.status, body);
  }
  return body as T;
}

export const api = {
  get: <T>(path: string, opts: { mock?: () => T | Promise<T>; skipAuth?: boolean } = {}) =>
    apiFetch<T>(path, { method: "GET", ...opts }),
  post: <T>(path: string, data?: Json | FormData, opts: { mock?: () => T | Promise<T>; skipAuth?: boolean } = {}) =>
    apiFetch<T>(path, {
      method: "POST",
      body: data instanceof FormData ? data : data !== undefined ? JSON.stringify(data) : undefined,
      ...opts,
    }),
  patch: <T>(path: string, data?: Json, opts: { mock?: () => T | Promise<T>; skipAuth?: boolean } = {}) =>
    apiFetch<T>(path, {
      method: "PATCH",
      body: data !== undefined ? JSON.stringify(data) : undefined,
      ...opts,
    }),
  del: <T>(path: string, opts: { mock?: () => T | Promise<T>; skipAuth?: boolean } = {}) =>
    apiFetch<T>(path, { method: "DELETE", ...opts }),
};
