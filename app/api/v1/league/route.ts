import { notImplementedResponse } from "@/lib/api-response";

/**
 * GET /api/v1/league
 * Returns current league info (Ekstraklasa)
 * Includes: currentSeason, currentRound, totalRounds, teamsCount
 * Cache: revalidateTag('league')
 */
export async function GET() {
  // TODO: Implement league fetch
  // - Fetch Ekstraklasa league document
  // - Return league metadata
  return notImplementedResponse();
}
