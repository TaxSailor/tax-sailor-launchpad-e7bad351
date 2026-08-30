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
import { api } from "@/lib/api";

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

// ---- Auth actions ------------------------------------------------------

async function fetchMe(): Promise<User> {
  const u = await api.get<UserResponse>("/auth/me");
  return mapUser(u);
}

async function commitToken(t: TokenResponse): Promise<User> {
  // The login response carries no user object, so hydrate from /auth/me.
  setSession({
    token: t.access_token,
    expires_at: Date.now() + t.expires_in * 1000,
    user: { id: "pending", email: "", role: "user" },
  });
  const user = await fetchMe();
  setSession({
    token: t.access_token,
    expires_at: Date.now() + t.expires_in * 1000,
    user,
  });
  return user;
}

export async function login(email: string, password: string) {
  const t = await api.post<TokenResponse>("/auth/login", { email, password }, { skipAuth: true });
  return commitToken(t);
}

export async function register(email: string, password: string) {
  const t = await api.post<TokenResponse>("/auth/register", { email, password }, { skipAuth: true });
  return commitToken(t);
}

export async function requestMagicLink(email: string) {
  return api.post<MagicLinkCreatedResponse>("/auth/magic-link", { email }, { skipAuth: true });
}

export async function redeemMagicLink(token: string) {
  const t = await api.post<TokenResponse>("/auth/magic-link", { token }, { skipAuth: true });
  return commitToken(t);
}

export async function forgotPassword(email: string) {
  return api.post<PasswordResetRequestedResponse>(
    "/auth/forgot-password",
    { email },
    { skipAuth: true },
  );
}

export async function resetPassword(token: string, password: string) {
  const t = await api.post<TokenResponse>(
    "/auth/reset-password",
    { token, password },
    { skipAuth: true },
  );
  return commitToken(t);
}

/**
 * Browser redirect to the backend OAuth authorize endpoint. The backend is
 * mounted at /api on the same origin in production; the return_to points back
 * at our callback route, which reads the token from the query string.
 */
export function signInWithOAuth(provider: "google" | "facebook", returnTo = "/workspace") {
  const target = new URL(`${window.location.origin}/api/auth/oauth/${provider}/authorize`);
  target.searchParams.set(
    "return_to",
    `${window.location.origin}/auth/callback?return_to=${encodeURIComponent(returnTo)}`,
  );
  window.location.href = target.toString();
}

export async function completeOAuthCallback(params: URLSearchParams): Promise<User> {
  // Backend redirects with either ?access_token=...&expires_in=... or ?token=...
  const token = params.get("access_token") ?? params.get("token");
  const expiresIn = Number(params.get("expires_in") ?? 3600);
  if (!token) throw new Error("Missing access token in OAuth callback");
  return commitToken({ access_token: token, expires_in: expiresIn });
}

export async function logout() {
  // Bearer tokens are stateless, so sign-out clears local state only.
  setSession(null);
}

