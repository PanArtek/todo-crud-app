import { notImplementedResponse } from "@/lib/api-response";

/**
 * GET /api/v1/standings
 * Returns league standings calculated from Match collection
 * Cache: revalidateTag('standings')
 */
export async function GET() {
  // TODO: Implement calculateStandings() aggregation
  // - Aggregate from Match collection
  // - Apply head-to-head tiebreaker rules
  // - Return sorted standings
  return notImplementedResponse();
}
