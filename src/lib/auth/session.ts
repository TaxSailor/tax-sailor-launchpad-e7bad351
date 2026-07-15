// Client-side auth session store — reads/writes token in localStorage,
// exposes a subscribable state and a useSession hook.
//
// Endpoints match the FastAPI backend (no /api prefix):
//   POST /auth/register            → TokenResponse
//   POST /auth/login               → TokenResponse
//   POST /auth/magic-link {email}  → MagicLinkCreatedResponse
//   POST /auth/magic-link {token}  → TokenResponse
//   POST /auth/forgot-password     → PasswordResetRequestedResponse
//   POST /auth/reset-password      → TokenResponse
//   GET  /auth/me                  → UserResponse
// There is intentionally no /auth/logout — sign-out is client-side only.

import { useSyncExternalStore } from "react";
import { api, IS_MOCK_API } from "@/lib/api";

const STORAGE_KEY = "taxsailor.session.v1";

export type UserRole = "user" | "admin";

export type User = {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  avatar_url?: string;
  entitlement_tier?: string;
  email_verified?: boolean;
};

export type Session = {
  token: string;
  expires_at: number; // epoch ms
  user: User;
};

type State = { session: Session | null; loading: boolean };

let state: State = { session: null, loading: true };
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function readStored(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    if (!parsed?.token || !parsed?.user || parsed.expires_at < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStored(session: Session | null) {
  if (typeof window === "undefined") return;
  if (session) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  else window.localStorage.removeItem(STORAGE_KEY);
}

export function initSession() {
  if (typeof window === "undefined") return;
  state = { session: readStored(), loading: false };
  emit();
}

function setSession(session: Session | null) {
  state = { session, loading: false };
  writeStored(session);
  emit();
}

export function getAuthToken(): string | null {
  return state.session?.token ?? null;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): State {
  return state;
}

const SERVER_SNAPSHOT: State = { session: null, loading: true };
function getServerSnapshot(): State {
  return SERVER_SNAPSHOT;
}

export function useSession() {
  const s = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    session: s.session,
    user: s.session?.user ?? null,
    isAuthenticated: !!s.session,
    loading: s.loading,
  };
}

// ---- Types matching backend contracts ----------------------------------

type TokenResponse = { access_token: string; token_type?: string; expires_in: number };
type UserResponse = {
  id: number | string;
  email: string;
  role: "guest" | "demo" | "advisor" | "admin";
  is_admin: boolean;
  entitlement_tier?: string;
  email_verified?: boolean;
  display_name?: string | null;
  avatar_url?: string | null;
};
type MagicLinkCreatedResponse = { message: string; expires_in: number; magic_link_token?: string | null };
type PasswordResetRequestedResponse = { message: string; expires_in?: number | null; reset_token?: string | null };

function mapUser(u: UserResponse): User {
  return {
    id: String(u.id),
    email: u.email,
    role: u.is_admin ? "admin" : "user",
    name: u.display_name ?? undefined,
    avatar_url: u.avatar_url ?? undefined,
    entitlement_tier: u.entitlement_tier,
    email_verified: u.email_verified,
  };
}

// ---- Mock helpers ------------------------------------------------------

function fakeUser(email: string): User {
  return {
    id: `mock-${email}`,
    email,
    role: email.endsWith("@taxsailor.com") ? "admin" : "user",
    name: email.split("@")[0],
    entitlement_tier: "anonymous",
    email_verified: true,
  };
}

function fakeSession(email: string): Session {
  return {
    token: `mock.${btoa(email)}.${Date.now()}`,
    expires_at: Date.now() + 1000 * 60 * 60 * 24 * 7,
    user: fakeUser(email),
  };
}

// ---- Auth actions ------------------------------------------------------

async function fetchMe(): Promise<User> {
  const u = await api.get<UserResponse>("/auth/me", {
    mock: async () => ({ id: 1, email: "you@taxsailor.com", role: "guest", is_admin: false }),
  });
  return mapUser(u);
}

function commitToken(t: TokenResponse, mockEmail?: string) {
  return (async () => {
    const user = IS_MOCK_API && mockEmail
      ? fakeUser(mockEmail)
      : await fetchMe();
    setSession({
      token: t.access_token,
      expires_at: Date.now() + t.expires_in * 1000,
      user,
    });
    return user;
  })();
}

export async function login(email: string, password: string) {
  const t = await api.post<TokenResponse>(
    "/auth/login",
    { email, password },
    { mock: () => ({ access_token: fakeSession(email).token, expires_in: 3600 * 24 * 7 }), skipAuth: true },
  );
  return commitToken(t, email);
}

export async function register(email: string, password: string) {
  const t = await api.post<TokenResponse>(
    "/auth/register",
    { email, password },
    { mock: () => ({ access_token: fakeSession(email).token, expires_in: 3600 * 24 * 7 }), skipAuth: true },
  );
  return commitToken(t, email);
}

export async function requestMagicLink(email: string) {
  return api.post<MagicLinkCreatedResponse>(
    "/auth/magic-link",
    { email },
    { mock: () => ({ message: "Check your inbox.", expires_in: 900 }), skipAuth: true },
  );
}

export async function redeemMagicLink(token: string) {
  const t = await api.post<TokenResponse>(
    "/auth/magic-link",
    { token },
    { mock: () => ({ access_token: fakeSession("magic@taxsailor.com").token, expires_in: 3600 }), skipAuth: true },
  );
  return commitToken(t, "magic@taxsailor.com");
}

export async function forgotPassword(email: string) {
  return api.post<PasswordResetRequestedResponse>(
    "/auth/forgot-password",
    { email },
    { mock: () => ({ message: "Check your inbox.", expires_in: 900 }), skipAuth: true },
  );
}

export async function resetPassword(token: string, password: string) {
  const t = await api.post<TokenResponse>(
    "/auth/reset-password",
    { token, password },
    { mock: () => ({ access_token: fakeSession("reset@taxsailor.com").token, expires_in: 3600 * 24 * 7 }), skipAuth: true },
  );
  return commitToken(t, "reset@taxsailor.com");
}

export function signInWithOAuth(provider: "google" | "facebook", returnTo = "/workspace") {
  if (IS_MOCK_API) {
    const url = new URL(window.location.origin + "/auth/callback");
    url.searchParams.set("provider", provider);
    url.searchParams.set("mock", "1");
    url.searchParams.set("return_to", returnTo);
    window.location.href = url.toString();
    return;
  }
  // Backend endpoint: GET /oauth/{provider}/authorize?return_to=...
  const url = new URL(`${window.location.origin}/oauth/${provider}/authorize`);
  // For real cross-origin backend, use API_BASE_URL directly:
  const { API_BASE_URL } = require("@/lib/api") as typeof import("@/lib/api");
  const target = API_BASE_URL
    ? new URL(`${API_BASE_URL}/oauth/${provider}/authorize`)
    : url;
  target.searchParams.set("return_to", `${window.location.origin}/auth/callback?return_to=${encodeURIComponent(returnTo)}`);
  window.location.href = target.toString();
}

export async function completeOAuthCallback(params: URLSearchParams): Promise<User> {
  if (params.get("mock") === "1") {
    const email = `${params.get("provider") ?? "oauth"}@taxsailor.com`;
    const s = fakeSession(email);
    setSession(s);
    return s.user;
  }
  // Backend redirects with either ?access_token=...&expires_in=... or ?token=...
  const token = params.get("access_token") ?? params.get("token");
  const expiresIn = Number(params.get("expires_in") ?? 3600);
  if (!token) throw new Error("Missing access token in OAuth callback");
  // Persist a placeholder session then hydrate via /auth/me.
  setSession({
    token,
    expires_at: Date.now() + expiresIn * 1000,
    user: { id: "pending", email: "", role: "user" },
  });
  const user = await fetchMe();
  setSession({ token, expires_at: Date.now() + expiresIn * 1000, user });
  return user;
}

export async function logout() {
  // No server-side session to revoke — bearer tokens are stateless.
  setSession(null);
}
