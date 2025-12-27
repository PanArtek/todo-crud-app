/**
 * GET /api/v1/standings
 *
 * Returns league standings calculated from Match collection.
 * Standings are computed on-the-fly using head-to-head tiebreaker rules.
 *
 * Cache: revalidateTag('standings')
 */

import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { connectToDatabase } from "@/lib/mongodb";
import { calculateStandings } from "@/lib/standings";
import { ApiErrors } from "@/lib/api-response";
import League from "@/models/League";
import type { Standing } from "@/types";

/**
 * Response meta information
 */
interface StandingsMeta {
  season: string;
  currentRound: number;
  lastUpdated: string;
}

/**
 * Cached standings calculation
 * Revalidates when 'standings' tag is triggered
 */
const getCachedStandings = unstable_cache(
  async (season: string): Promise<Standing[]> => {
    return calculateStandings(season);
  },
  ["standings"],
  {
    tags: ["standings"],
    revalidate: 60, // Fallback: revalidate every 60 seconds
  }
);

/**
 * GET /api/v1/standings
 *
 * @returns {Promise<NextResponse>} League standings with metadata
 *
 * @example
 * // Success response
 * {
 *   "success": true,
 *   "data": [...standings],
 *   "meta": {
 *     "season": "2024/2025",
 *     "currentRound": 15,
 *     "lastUpdated": "2025-01-15T10:30:00.000Z"
 *   }
 * }
 */
export async function GET(): Promise<NextResponse> {
  try {
    // Connect to MongoDB
    await connectToDatabase();

    // Get league information (Ekstraklasa = PL)
    const league = await League.findOne({ country: "PL" })
      .select("currentSeason currentRound")
      .lean();

    if (!league) {
      console.error("[Standings API] League not found for country: PL");
      return ApiErrors.notFound("Liga nie została znaleziona");
    }

    // Calculate standings (cached)
    const standings = await getCachedStandings(league.currentSeason);

    // Build response with metadata
    const meta: StandingsMeta = {
      season: league.currentSeason,
      currentRound: league.currentRound,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: standings,
        meta,
      },
      { status: 200 }
    );
  } catch (error) {
    // Log error for debugging
    console.error("[Standings API] Error:", error);

    // Return generic error to client
    return ApiErrors.internal("Wystąpił błąd podczas pobierania tabeli");
  }
}

/**
 * Explicitly set dynamic rendering
 * We use unstable_cache with tags for on-demand revalidation
 */
export const dynamic = "force-dynamic";
