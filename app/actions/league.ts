"use server";

import { revalidateTag } from "next/cache";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth-utils";
import League from "@/models/League";
import Match from "@/models/Match";
import Team from "@/models/Team";
import { updateCurrentRoundSchema } from "@/lib/validations/league";

interface ActionResult {
  success: boolean;
  error?: string;
  data?: unknown;
}

/**
 * Get current league info
 */
export async function getLeagueInfo(): Promise<ActionResult> {
  try {
    await connectToDatabase();

    const league = await League.findOne({ country: "PL" })
      .select("name country logo currentSeason currentRound totalRounds teamsCount")
      .lean();

    if (!league) {
      return {
        success: false,
        error: "Liga nie zostala znaleziona",
      };
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(league)),
    };
  } catch (error) {
    console.error("[League Action] Error getting league:", error);
    return {
      success: false,
      error: "Nie udalo sie pobrac danych ligi",
    };
  }
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<ActionResult> {
  try {
    await connectToDatabase();

    const league = await League.findOne({ country: "PL" })
      .select("currentSeason currentRound totalRounds")
      .lean();

    if (!league) {
      return {
        success: false,
        error: "Liga nie zostala znaleziona",
      };
    }

    // Get team count
    const teamsCount = await Team.countDocuments({ leagueId: league._id });

    // Get match statistics for current season
    const [totalMatches, finishedMatches, scheduledMatches, liveMatches] =
      await Promise.all([
        Match.countDocuments({ season: league.currentSeason }),
        Match.countDocuments({ season: league.currentSeason, status: "FINISHED" }),
        Match.countDocuments({ season: league.currentSeason, status: "SCHEDULED" }),
        Match.countDocuments({ season: league.currentSeason, status: "LIVE" }),
      ]);

    // Get matches by round for current season
    const matchesByRound = await Match.aggregate([
      { $match: { season: league.currentSeason } },
      {
        $group: {
          _id: "$round",
          total: { $sum: 1 },
          finished: {
            $sum: { $cond: [{ $eq: ["$status", "FINISHED"] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return {
      success: true,
      data: {
        currentSeason: league.currentSeason,
        currentRound: league.currentRound,
        totalRounds: league.totalRounds,
        teamsCount,
        totalMatches,
        finishedMatches,
        scheduledMatches,
        liveMatches,
        remainingMatches: totalMatches - finishedMatches,
        matchesByRound,
      },
    };
  } catch (error) {
    console.error("[League Action] Error getting dashboard stats:", error);
    return {
      success: false,
      error: "Nie udalo sie pobrac statystyk",
    };
  }
}

/**
 * Update current round
 */
export async function updateCurrentRound(
  currentRound: number
): Promise<ActionResult> {
  try {
    await requireAdmin();
    await connectToDatabase();

    // Validate
    const result = updateCurrentRoundSchema.safeParse({ currentRound });
    if (!result.success) {
      return {
        success: false,
        error: result.error.issues[0]?.message ?? "Nieprawidlowe dane",
      };
    }

    const league = await League.findOne({ country: "PL" });
    if (!league) {
      return {
        success: false,
        error: "Liga nie zostala znaleziona",
      };
    }

    // Update current round
    const updatedLeague = await League.findByIdAndUpdate(
      league._id,
      { $set: { currentRound: result.data.currentRound } },
      { new: true }
    ).lean();

    // Revalidate cache
    revalidateTag("league", "default");
    revalidateTag("matches", "default");

    return {
      success: true,
      data: JSON.parse(JSON.stringify(updatedLeague)),
    };
  } catch (error) {
    console.error("[League Action] Error updating current round:", error);
    return {
      success: false,
      error: "Nie udalo sie zaktualizowac aktualnej kolejki",
    };
  }
}

/**
 * Get league settings for admin
 */
export async function getLeagueSettings(): Promise<ActionResult> {
  try {
    await requireAdmin();
    await connectToDatabase();

    const league = await League.findOne({ country: "PL" }).lean();

    if (!league) {
      return {
        success: false,
        error: "Liga nie zostala znaleziona",
      };
    }

    // Get statistics for the settings page
    const [totalMatches, finishedMatches] = await Promise.all([
      Match.countDocuments({ season: league.currentSeason }),
      Match.countDocuments({ season: league.currentSeason, status: "FINISHED" }),
    ]);

    return {
      success: true,
      data: {
        league: JSON.parse(JSON.stringify(league)),
        stats: {
          totalMatches,
          finishedMatches,
          remainingMatches: totalMatches - finishedMatches,
        },
      },
    };
  } catch (error) {
    console.error("[League Action] Error getting league settings:", error);
    return {
      success: false,
      error: "Nie udalo sie pobrac ustawien ligi",
    };
  }
}
