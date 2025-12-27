import { connectToDatabase } from "@/lib/mongodb";
import { ApiErrors, successResponse } from "@/lib/api-response";
import League from "@/models/League";

/**
 * GET /api/v1/league
 * Returns current league info (Ekstraklasa)
 * Includes: currentSeason, currentRound, totalRounds, teamsCount
 * Cache: revalidateTag('league')
 */
export async function GET() {
  try {
    await connectToDatabase();

    const league = await League.findOne({ country: "PL" })
      .select("name country logo currentSeason currentRound totalRounds teamsCount")
      .lean();

    if (!league) {
      return ApiErrors.notFound("Liga nie zostala znaleziona");
    }

    return successResponse(league);
  } catch (error) {
    console.error("[League API] Error:", error);
    return ApiErrors.internal("Wystapil blad podczas pobierania danych ligi");
  }
}

export const dynamic = "force-dynamic";
