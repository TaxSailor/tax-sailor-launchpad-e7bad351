// Typed fetch client for the TaxSailor FastAPI backend.
//
// Base URL comes from VITE_API_BASE_URL (e.g. "https://taxsailor-web.onrender.com").
// When unset (Lovable preview / local dev without backend), the client runs in
// MOCK mode: reads return canned fixtures, writes simulate 200 OK after a small
// delay. This lets us design and QA the whole surface before cutover.

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
  init: RequestInit & { mock?: () => T | Promise<T> } = {},
): Promise<T> {
  if (IS_MOCK_API) {
    if (!init.mock) throw new ApiError(`No mock for ${path}`, 501, null);
    await delay(300);
    return init.mock();
  }
  const url = `${API_BASE_URL}${path}`;
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Accept", "application/json");
  // Attach bearer token if present (dynamic import to avoid client/api cycle).
  try {
    const { getAuthToken } = await import("@/lib/auth/session");
    const t = getAuthToken();
    if (t && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${t}`);
  } catch {
    /* noop */
  }

  const res = await fetch(url, {
    ...init,
    headers,
    credentials: "include",
  });

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
    const msg =
      (body && typeof body === "object" && "detail" in body
        ? String((body as { detail: unknown }).detail)
        : `Request failed: ${res.status}`) || `HTTP ${res.status}`;
    throw new ApiError(msg, res.status, body);
  }
  return body as T;
}

export const api = {
  get: <T>(path: string, opts: { mock?: () => T | Promise<T> } = {}) =>
    apiFetch<T>(path, { method: "GET", mock: opts.mock }),
  post: <T>(path: string, data?: Json | FormData, opts: { mock?: () => T | Promise<T> } = {}) =>
    apiFetch<T>(path, {
      method: "POST",
      body: data instanceof FormData ? data : data ? JSON.stringify(data) : undefined,
      mock: opts.mock,
    }),
  patch: <T>(path: string, data?: Json, opts: { mock?: () => T | Promise<T> } = {}) =>
    apiFetch<T>(path, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
      mock: opts.mock,
    }),
  del: <T>(path: string, opts: { mock?: () => T | Promise<T> } = {}) =>
    apiFetch<T>(path, { method: "DELETE", mock: opts.mock }),
};
