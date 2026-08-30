// Shared, client-safe types for the backend proxy transport.

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

export type ProxyResult = {
  ok: boolean;
  status: number;
  body: Json;
};
