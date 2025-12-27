import { notImplementedResponse } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/matches/[id]
 * Returns a single match with populated teams
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  void id;

  // TODO: Implement match fetch
  // - Find match by ID
  // - Populate home/away team references
  // - Return match data
  return notImplementedResponse();
}

/**
 * PUT /api/v1/matches/[id]
 * Updates an existing match
 * Auth: requireAdmin()
 * Revalidate: 'matches', 'standings'
 */
export async function PUT(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  void id;

  // TODO: Implement match update
  // - Validate request body with Zod
  // - Check admin authorization
  // - Update match in database
  // - Revalidate cache (matches + standings if score changed)
  return notImplementedResponse();
}

/**
 * DELETE /api/v1/matches/[id]
 * Deletes a match
 * Auth: requireAdmin()
 * Revalidate: 'matches', 'standings'
 */
export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  void id;

  // TODO: Implement match deletion
  // - Check admin authorization
  // - Delete match from database
  // - Revalidate cache
  return notImplementedResponse();
}
