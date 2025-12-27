import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ApiErrors, successResponse } from "@/lib/api-response";
import Match from "@/models/Match";
import League from "@/models/League";
import type { MatchStatus } from "@/models/Match";

type StatusFilter = MatchStatus | "upcoming" | "played";

interface MatchQuery {
  season: string;
  round?: number;
  status?: MatchStatus | { $in: MatchStatus[] };
  $or?: Array<{ homeTeam: string } | { awayTeam: string }>;
}

/**
 * GET /api/v1/matches
 * Returns matches with optional filters
 * Query params: ?round=15&season=2024/2025&teamId=xxx&status=FINISHED
 * Cache: revalidateTag('matches')
 */
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const round = searchParams.get("round");
    const season = searchParams.get("season");
    const teamId = searchParams.get("teamId");
    const status = searchParams.get("status") as StatusFilter | null;

    // Get current season if not provided
    let currentSeason = season;
    if (!currentSeason) {
      const league = await League.findOne({ country: "PL" })
        .select("currentSeason")
        .lean();
      if (!league) {
        return ApiErrors.notFound("Liga nie zostala znaleziona");
      }
      currentSeason = league.currentSeason;
    }

    // Build query
    const query: MatchQuery = { season: currentSeason };

    if (round) {
      const roundNum = parseInt(round, 10);
      if (isNaN(roundNum) || roundNum < 1 || roundNum > 34) {
        return ApiErrors.badRequest("Nieprawidlowy numer kolejki (1-34)");
      }
      query.round = roundNum;
    }

    if (teamId) {
      query.$or = [{ homeTeam: teamId }, { awayTeam: teamId }];
    }

    if (status) {
      if (status === "upcoming") {
        query.status = { $in: ["SCHEDULED", "POSTPONED"] };
      } else if (status === "played") {
        query.status = "FINISHED";
      } else {
        query.status = status;
      }
    }

    // Fetch matches with populated teams
    const matches = await Match.find(query)
      .populate("homeTeam", "name shortName slug logo")
      .populate("awayTeam", "name shortName slug logo")
      .sort({ date: 1, time: 1 })
      .lean();

    return successResponse(matches);
  } catch (error) {
    console.error("[Matches API] Error:", error);
    return ApiErrors.internal("Wystapil blad podczas pobierania meczow");
  }
}

/**
 * POST /api/v1/matches
 * Creates a new match
 * Auth: requireAdmin()
 * Revalidate: 'matches'
 */
export async function POST() {
  // TODO: Implement match creation with admin auth
  return NextResponse.json(
    {
      success: true,
      data: null,
      message: "Not implemented - requires admin authentication",
    },
    { status: 501 }
  );
}

export const dynamic = "force-dynamic";
