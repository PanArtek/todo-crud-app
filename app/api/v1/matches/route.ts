import { notImplementedResponse } from "@/lib/api-response";

/**
 * GET /api/v1/matches
 * Returns matches with optional filters
 * Query params: ?round=15&season=2024/2025&teamId=xxx&status=FINISHED
 * Cache: revalidateTag('matches')
 */
export async function GET() {
  // TODO: Implement match listing
  // - Parse query parameters
  // - Apply filters (round, season, team, status)
  // - Populate team references
  // - Return paginated results
  return notImplementedResponse();
}

/**
 * POST /api/v1/matches
 * Creates a new match
 * Auth: requireAdmin()
 * Revalidate: 'matches'
 */
export async function POST() {
  // TODO: Implement match creation
  // - Validate request body with Zod
  // - Check admin authorization
  // - Validate teams exist
  // - Create match in database
  // - Revalidate cache
  return notImplementedResponse();
}
