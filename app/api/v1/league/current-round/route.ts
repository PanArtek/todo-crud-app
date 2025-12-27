import { notImplementedResponse } from "@/lib/api-response";

/**
 * PUT /api/v1/league/current-round
 * Updates the current round for the league
 * Auth: requireAdmin()
 * Revalidate: 'league'
 *
 * Body: { currentRound: number }
 *
 * This controls which round is displayed by default in Terminarz
 */
export async function PUT() {
  // TODO: Implement current round update
  // - Validate request body (round: 1-34)
  // - Check admin authorization
  // - Update league currentRound
  // - Revalidate 'league' cache
  return notImplementedResponse();
}
