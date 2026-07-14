// Admin API surface. Mirrors FastAPI /api/admin/* endpoints; mock returns fixtures.

import { api } from "@/lib/api";

export type LeadRow = {
  id: string;
  email: string;
  name: string | null;
  audience: string;
  message: string | null;
  created_at: string;
  status: "new" | "contacted" | "qualified" | "closed";
};

export type UserRow = {
  id: string;
  email: string;
  display_name: string | null;
  role: "user" | "admin";
  tier: string;
  created_at: string;
  last_login_at: string | null;
};

export type AdminMetrics = {
  users_total: number;
  users_new_7d: number;
  leads_total: number;
  leads_new_7d: number;
  simulations_total: number;
  simulations_7d: number;
  mrr_eur: number;
  paying_customers: number;
};

const iso = (daysAgo: number) =>
  new Date(Date.now() - daysAgo * 86_400_000).toISOString();

const MOCK_LEADS: LeadRow[] = [
  { id: "L-1042", email: "clara@northlake.vc", name: "Clara Nord", audience: "investors", message: "Seed thesis fit — 30 min?", created_at: iso(0.2), status: "new" },
  { id: "L-1041", email: "raj@northwind.io", name: "Raj Patel", audience: "corporations", message: "IP box for a €12M R&D unit", created_at: iso(1), status: "contacted" },
  { id: "L-1040", email: "maria@ateliermv.com", name: "Maria Voss", audience: "pilot", message: "Design studio, 8 people, DE/PT", created_at: iso(2), status: "new" },
  { id: "L-1039", email: "j.werner@gmail.com", name: "Jonas Werner", audience: "individuals", message: null, created_at: iso(3), status: "qualified" },
  { id: "L-1038", email: "founder@ledgerloop.xyz", name: "Sam Kettering", audience: "pilot", message: "YC F24 — cap table structure", created_at: iso(4), status: "closed" },
  { id: "L-1037", email: "eva@brikpartners.eu", name: "Eva Brik", audience: "corporations", message: "Holding restructure NL→LU", created_at: iso(6), status: "contacted" },
];

const MOCK_USERS: UserRow[] = [
  { id: "U-201", email: "you@taxsailor.com", display_name: "You", role: "admin", tier: "enterprise", created_at: iso(60), last_login_at: iso(0.1) },
  { id: "U-198", email: "clara@northlake.vc", display_name: "Clara Nord", role: "user", tier: "professional", created_at: iso(30), last_login_at: iso(1) },
  { id: "U-192", email: "raj@northwind.io", display_name: "Raj Patel", role: "user", tier: "premium", created_at: iso(45), last_login_at: iso(0.5) },
  { id: "U-188", email: "maria@ateliermv.com", display_name: "Maria Voss", role: "user", tier: "consumer", created_at: iso(21), last_login_at: iso(4) },
  { id: "U-181", email: "j.werner@gmail.com", display_name: "Jonas Werner", role: "user", tier: "consumer", created_at: iso(12), last_login_at: iso(2) },
];

export function getAdminMetrics() {
  return api.get<AdminMetrics>("/api/admin/metrics", {
    mock: () => ({
      users_total: 128,
      users_new_7d: 14,
      leads_total: 42,
      leads_new_7d: 9,
      simulations_total: 1_284,
      simulations_7d: 172,
      mrr_eur: 4_820,
      paying_customers: 23,
    }),
  });
}

export function listLeads() {
  return api.get<{ items: LeadRow[] }>("/api/admin/leads", {
    mock: () => ({ items: MOCK_LEADS }),
  });
}

export function updateLeadStatus(id: string, status: LeadRow["status"]) {
  return api.patch<{ ok: boolean }>(
    `/api/admin/leads/${id}`,
    { status },
    { mock: () => ({ ok: true }) },
  );
}

export function listUsers() {
  return api.get<{ items: UserRow[] }>("/api/admin/users", {
    mock: () => ({ items: MOCK_USERS }),
  });
}

export function setUserRole(id: string, role: "user" | "admin") {
  return api.patch<{ ok: boolean }>(
    `/api/admin/users/${id}`,
    { role },
    { mock: () => ({ ok: true }) },
  );
}
