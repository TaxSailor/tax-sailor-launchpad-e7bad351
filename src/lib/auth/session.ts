// Client-side auth session store — reads/writes token in localStorage,
// exposes a subscribable state and a useSession hook.
//
// In MOCK mode (VITE_API_BASE_URL unset), any credentials succeed and produce
// a fake user. In real mode, hits the FastAPI /auth/* endpoints and stores the
// returned bearer token. The FastAPI backend accepts httpOnly-cookie sessions
// AND Authorization: Bearer tokens; we use bearer to keep things portable.

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

// Subscribe API for useSyncExternalStore.
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): State {
  return state;
}

function getServerSnapshot(): State {
  return { session: null, loading: true };
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

// ---- Auth actions ------------------------------------------------------

function fakeUser(email: string): User {
  return {
    id: `mock-${email}`,
    email,
    role: email.endsWith("@taxsailor.com") ? "admin" : "user",
    name: email.split("@")[0],
  };
}

function fakeSession(email: string): Session {
  return {
    token: `mock.${btoa(email)}.${Date.now()}`,
    expires_at: Date.now() + 1000 * 60 * 60 * 24 * 7,
    user: fakeUser(email),
  };
}

type TokenResponse = { access_token: string; expires_in: number };
type UserResponse = { id: string; email: string; role: UserRole; display_name?: string };

async function fetchMe(token: string): Promise<User> {
  const u = await api.get<UserResponse>("/api/auth/me", {
    mock: async () => ({ id: "mock", email: "you@taxsailor.com", role: "user" }),
  });
  return { id: u.id, email: u.email, role: u.role, name: u.display_name };
}

export async function login(email: string, password: string) {
  const t = await api.post<TokenResponse>(
    "/api/auth/login",
    { email, password },
    { mock: () => ({ access_token: fakeSession(email).token, expires_in: 3600 * 24 * 7 }) },
  );
  const user = IS_MOCK_API ? fakeUser(email) : await fetchMe(t.access_token);
  setSession({ token: t.access_token, expires_at: Date.now() + t.expires_in * 1000, user });
  return user;
}

export async function register(email: string, password: string, display_name?: string) {
  const t = await api.post<TokenResponse>(
    "/api/auth/register",
    { email, password, display_name },
    { mock: () => ({ access_token: fakeSession(email).token, expires_in: 3600 * 24 * 7 }) },
  );
  const user = IS_MOCK_API ? fakeUser(email) : await fetchMe(t.access_token);
  setSession({ token: t.access_token, expires_at: Date.now() + t.expires_in * 1000, user });
  return user;
}

export async function requestMagicLink(email: string) {
  await api.post<{ ok: boolean }>(
    "/api/auth/magic-link",
    { email },
    { mock: () => ({ ok: true }) },
  );
}

export async function redeemMagicLink(token: string) {
  const t = await api.post<TokenResponse>(
    "/api/auth/magic-link/redeem",
    { token },
    { mock: () => ({ access_token: fakeSession("magic@taxsailor.com").token, expires_in: 3600 }) },
  );
  const email = IS_MOCK_API ? "magic@taxsailor.com" : "";
  const user = IS_MOCK_API ? fakeUser(email) : await fetchMe(t.access_token);
  setSession({ token: t.access_token, expires_at: Date.now() + t.expires_in * 1000, user });
  return user;
}

export function signInWithOAuth(provider: "google" | "facebook", returnTo = "/workspace") {
  if (IS_MOCK_API) {
    // Simulate the redirect roundtrip: land back on /auth/callback with a mock code.
    const url = new URL(window.location.origin + "/auth/callback");
    url.searchParams.set("provider", provider);
    url.searchParams.set("mock", "1");
    url.searchParams.set("return_to", returnTo);
    window.location.href = url.toString();
    return;
  }
  const url = new URL(`${window.location.origin}/api/oauth/${provider}/authorize`);
  url.searchParams.set("return_to", returnTo);
  window.location.href = url.toString();
}

export async function completeOAuthCallback(params: URLSearchParams): Promise<User> {
  if (params.get("mock") === "1") {
    const email = `${params.get("provider") ?? "oauth"}@taxsailor.com`;
    const s = fakeSession(email);
    setSession(s);
    return s.user;
  }
  const token = params.get("token");
  const expiresIn = Number(params.get("expires_in") ?? 3600);
  if (!token) throw new ApiErrorLike("Missing token in OAuth callback");
  const user = await fetchMe(token);
  setSession({ token, expires_at: Date.now() + expiresIn * 1000, user });
  return user;
}

class ApiErrorLike extends Error {}

export async function logout() {
  try {
    if (!IS_MOCK_API) {
      await api.post<{ ok: boolean }>("/api/auth/logout", {}).catch(() => undefined);
    }
  } finally {
    setSession(null);
  }
}
