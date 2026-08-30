// Evidence clients: legal sources and per-hop citations for a computed route.
// Backed by the documents router (/documents/*) on the FastAPI deployment.

import { api } from "@/lib/api";
import type {
  DocumentSourceResponse,
  EdgeCitationResponse,
  RouteCitationsResponse,
  RouteSourcesResponse,
} from "@/lib/contracts";
import type { PathEdgeDetail } from "@/lib/workspace/scenarios";

export type { DocumentSourceResponse, EdgeCitationResponse };

export type DocumentStoreSummary = {
  total_sources?: number | null;
  total_snippets?: number | null;
  treaty_sources?: number | null;
  [key: string]: unknown;
};

/** Aggregate counts for the document store, used for the evidence header line. */
export async function fetchDocumentSummary(): Promise<DocumentStoreSummary> {
  return api.get<DocumentStoreSummary>("/documents/summary");
}

/** Treaty and compliance documents backing every hop of a route. */
export async function fetchRouteSources(
  path: string[],
  pathDetails?: PathEdgeDetail[] | null,
): Promise<RouteSourcesResponse> {
  return api.post<RouteSourcesResponse>("/documents/route-sources", {
    path,
    ...(pathDetails && pathDetails.length > 0 ? { path_details: pathDetails } : {}),
  } as unknown as Record<string, unknown>);
}

/** Per-hop legal references with rate basis, masked on gated tiers. */
export async function fetchRouteCitations(
  path: string[],
  pathDetails?: PathEdgeDetail[] | null,
  complianceWarnings?: string[] | null,
): Promise<RouteCitationsResponse> {
  return api.post<RouteCitationsResponse>("/documents/route-citations", {
    path,
    ...(pathDetails && pathDetails.length > 0 ? { path_details: pathDetails } : {}),
    ...(complianceWarnings && complianceWarnings.length > 0
      ? { compliance_warnings: complianceWarnings }
      : {}),
  } as unknown as Record<string, unknown>);
}
