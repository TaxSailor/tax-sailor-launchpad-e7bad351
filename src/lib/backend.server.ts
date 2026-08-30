// Server-only transport helpers for the TaxSailor FastAPI backend.
// Never imported from client code directly; the server functions in
// src/lib/api-proxy.functions.ts load these inside their handlers.

import type { Json, ProxyResult } from "@/lib/api-types";

function backendBase(): string {
  return (process.env["TAXSAILOR_API_BASE"] ?? "https://www.taxsailor.com").replace(/\/+$/, "");
}

function parseBody(text: string): Json {
  if (!text) return null;
  try {
    return JSON.parse(text) as Json;
  } catch {
    return text;
  }
}

function unreachable(err: unknown): ProxyResult {
  return {
    ok: false,
    status: 502,
    body: {
      detail: `Backend unreachable: ${err instanceof Error ? err.message : "network error"}`,
    },
  };
}

export async function callBackend(input: {
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  path: string;
  body?: unknown;
  token?: string | undefined;
}): Promise<ProxyResult> {
  const url = `${backendBase()}/api${input.path}`;
  const headers: Record<string, string> = { Accept: "application/json" };
  let bodyStr: string | undefined;
  if (input.body !== undefined && input.method !== "GET" && input.method !== "DELETE") {
    headers["Content-Type"] = "application/json";
    bodyStr = JSON.stringify(input.body);
  }
  if (input.token) headers["Authorization"] = `Bearer ${input.token}`;

  try {
    const res = await fetch(url, {
      method: input.method,
      headers,
      body: bodyStr,
      redirect: "manual",
    });
    return { ok: res.ok, status: res.status, body: parseBody(await res.text()) };
  } catch (err) {
    return unreachable(err);
  }
}

export async function uploadToBackend(input: {
  path: string;
  filename: string;
  contentType: string;
  base64: string;
  token?: string | undefined;
}): Promise<ProxyResult> {
  const url = `${backendBase()}/api${input.path}`;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (input.token) headers["Authorization"] = `Bearer ${input.token}`;

  try {
    const bytes = Uint8Array.from(atob(input.base64), (c) => c.charCodeAt(0));
    const form = new FormData();
    form.append("file", new Blob([bytes], { type: input.contentType }), input.filename);
    const res = await fetch(url, { method: "POST", headers, body: form, redirect: "manual" });
    return { ok: res.ok, status: res.status, body: parseBody(await res.text()) };
  } catch (err) {
    return unreachable(err);
  }
}
