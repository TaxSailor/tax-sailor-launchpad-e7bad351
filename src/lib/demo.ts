// Demo surface helpers.
//
// GET /event/qr/{token} redeems a cruise or event QR token and returns a
// demo-scoped bearer token, which we commit to the client session so the
// visitor lands in the workspace with a working entitlement.

import { api } from "@/lib/api";
import { applyToken } from "@/lib/auth/session";

export type EventQrResponse = {
  event: string;
  role: string;
  access_token: string;
  token_type?: string;
  expires_in: number;
  message: string;
};

export async function redeemQrToken(token: string): Promise<EventQrResponse> {
  const clean = token.trim();
  const res = await api.get<EventQrResponse>(
    `/event/qr/${encodeURIComponent(clean)}`,
    { skipAuth: true },
  );
  await applyToken(res.access_token, res.expires_in);
  return res;
}

/** The single corridor the demo proves: German dividend into the UAE. */
export const DEMO_CORRIDOR = {
  scenarioId: "corporate_dividend",
  origin: "Germany",
  destination: "United Arab Emirates",
  amount: 1_000_000,
} as const;
