"use server";

import { revalidateTag } from "next/cache";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth-utils";
import Match from "@/models/Match";
import League from "@/models/League";
import {
  createMatchSchema,
  updateMatchSchema,
  updateResultSchema,
} from "@/lib/validations/match";

interface ActionResult {
  success: boolean;
  error?: string;
  data?: unknown;
}

/**
 * Get all matches with optional filters
 */
export async function getMatches(filters?: {
  round?: number;
  status?: string;
  teamId?: string;
}): Promise<ActionResult> {
  try {
    await connectToDatabase();

    // Get current season
    const league = await League.findOne({ country: "PL" })
      .select("currentSeason")
      .lean();

    if (!league) {
      return {
        success: false,
        error: "Liga nie zostala znaleziona",
      };
    }

    interface MatchQuery {
      season: string;
      round?: number;
      status?: string | { $in: string[] };
      $or?: Array<{ homeTeam: string } | { awayTeam: string }>;
    }

    const query: MatchQuery = { season: league.currentSeason };

    if (filters?.round) {
      query.round = filters.round;
    }

    if (filters?.status) {
      if (filters.status === "upcoming") {
        query.status = { $in: ["SCHEDULED", "POSTPONED"] };
      } else if (filters.status === "played") {
        query.status = "FINISHED";
      } else {
        query.status = filters.status;
      }
    }

    if (filters?.teamId) {
      query.$or = [{ homeTeam: filters.teamId }, { awayTeam: filters.teamId }];
    }

    const matches = await Match.find(query)
      .populate("homeTeam", "name shortName slug logo")
      .populate("awayTeam", "name shortName slug logo")
      .sort({ round: 1, date: 1, time: 1 })
      .lean();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(matches)),
    };
  } catch (error) {
    console.error("[Matches Action] Error getting matches:", error);
    return {
      success: false,
      error: "Nie udalo sie pobrac meczow",
    };
  }
}

/**
 * Get single match by ID
 */
export async function getMatchById(id: string): Promise<ActionResult> {
  try {
    await connectToDatabase();

    const match = await Match.findById(id)
      .populate("homeTeam", "name shortName slug logo stadium")
      .populate("awayTeam", "name shortName slug logo")
      .lean();

    if (!match) {
      return {
        success: false,
        error: "Mecz nie zostal znaleziony",
      };
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(match)),
    };
  } catch (error) {
    console.error("[Matches Action] Error getting match:", error);
    return {
      success: false,
      error: "Nie udalo sie pobrac meczu",
    };
  }
}

/**
 * Get matches for current round (for results entry)
 */
export async function getMatchesForCurrentRound(): Promise<ActionResult> {
  try {
    await connectToDatabase();

    const league = await League.findOne({ country: "PL" })
      .select("currentSeason currentRound")
      .lean();

    if (!league) {
      return {
        success: false,
        error: "Liga nie zostala znaleziona",
      };
    }

    const matches = await Match.find({
      season: league.currentSeason,
      round: league.currentRound,
    })
      .populate("homeTeam", "name shortName slug logo")
      .populate("awayTeam", "name shortName slug logo")
      .sort({ date: 1, time: 1 })
      .lean();

    return {
      success: true,
      data: {
        matches: JSON.parse(JSON.stringify(matches)),
        currentRound: league.currentRound,
      },
    };
  } catch (error) {
    console.error("[Matches Action] Error getting current round matches:", error);
    return {
      success: false,
      error: "Nie udalo sie pobrac meczow biezacej kolejki",
    };
  }
}

/**
 * Create a new match
 */
export async function createMatch(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    await connectToDatabase();

    // Get league ID (Ekstraklasa)
    const league = await League.findOne({ country: "PL" })
      .select("_id currentSeason")
      .lean();

    if (!league) {
      return {
        success: false,
        error: "Liga nie zostala znaleziona",
      };
    }

    // Parse form data
    const homeTeam = formData.get("homeTeam") as string;
    const awayTeam = formData.get("awayTeam") as string;
    const round = Number(formData.get("round"));
    const season = (formData.get("season") as string) || league.currentSeason;
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;
    const stadium = formData.get("stadium") as string;

    const input = {
      leagueId: league._id.toString(),
      homeTeam,
      awayTeam,
      round,
      season,
      date,
      time: time || undefined,
      stadium: stadium || undefined,
      status: "SCHEDULED" as const,
      homeScore: null,
      awayScore: null,
    };

    // Validate
    const result = createMatchSchema.safeParse(input);
    if (!result.success) {
      return {
        success: false,
        error: result.error.issues[0]?.message ?? "Nieprawidlowe dane",
      };
    }

    // Check if match already exists in this round
    const existingMatch = await Match.findOne({
      season: result.data.season,
      round: result.data.round,
      $or: [
        { homeTeam: result.data.homeTeam, awayTeam: result.data.awayTeam },
        { homeTeam: result.data.awayTeam, awayTeam: result.data.homeTeam },
      ],
    });

    if (existingMatch) {
      return {
        success: false,
        error: "Mecz miedzy tymi druzunami w tej kolejce juz istnieje",
      };
    }

    // Create match
    const match = await Match.create(result.data);

    revalidateTag("matches", "default");

    return {
      success: true,
      data: JSON.parse(JSON.stringify(match)),
    };
  } catch (error) {
    console.error("[Matches Action] Error creating match:", error);
    return {
      success: false,
      error: "Nie udalo sie utworzyc meczu",
    };
  }
}

/**
 * Update a match
 */
export async function updateMatch(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    await requireAdmin();
    await connectToDatabase();

    const match = await Match.findById(id);
    if (!match) {
      return {
        success: false,
        error: "Mecz nie zostal znaleziony",
      };
    }

    // Parse form data
    const homeTeam = formData.get("homeTeam") as string;
    const awayTeam = formData.get("awayTeam") as string;
    const round = formData.get("round") ? Number(formData.get("round")) : undefined;
    const season = formData.get("season") as string;
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;
    const stadium = formData.get("stadium") as string;
    const status = formData.get("status") as string;

    const input = {
      homeTeam: homeTeam || undefined,
      awayTeam: awayTeam || undefined,
      round,
      season: season || undefined,
      date: date || undefined,
      time: time || undefined,
      stadium: stadium || undefined,
      status: status || undefined,
    };

    // Validate
    const result = updateMatchSchema.safeParse(input);
    if (!result.success) {
      return {
        success: false,
        error: result.error.issues[0]?.message ?? "Nieprawidlowe dane",
      };
    }

    // Update match
    const updatedMatch = await Match.findByIdAndUpdate(
      id,
      { $set: result.data },
      { new: true }
    )
      .populate("homeTeam", "name shortName slug logo")
      .populate("awayTeam", "name shortName slug logo")
      .lean();

    revalidateTag("matches", "default");
    revalidateTag("standings", "default");

    return {
      success: true,
      data: JSON.parse(JSON.stringify(updatedMatch)),
    };
  } catch (error) {
    console.error("[Matches Action] Error updating match:", error);
    return {
      success: false,
      error: "Nie udalo sie zaktualizowac meczu",
    };
  }
}

/**
 * Update match result
 * This is the main action for entering match scores
 */
export async function updateMatchResult(
  matchId: string,
  homeScore: number,
  awayScore: number
): Promise<ActionResult> {
  try {
    await requireAdmin();
    await connectToDatabase();

    const match = await Match.findById(matchId);
    if (!match) {
      return {
        success: false,
        error: "Mecz nie zostal znaleziony",
      };
    }

    // Validate
    const result = updateResultSchema.safeParse({
      homeScore,
      awayScore,
      status: "FINISHED",
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error.issues[0]?.message ?? "Nieprawidlowe dane",
      };
    }

    // Update match with result
    const updatedMatch = await Match.findByIdAndUpdate(
      matchId,
      {
        $set: {
          homeScore: result.data.homeScore,
          awayScore: result.data.awayScore,
          status: result.data.status,
        },
      },
      { new: true }
    )
      .populate("homeTeam", "name shortName slug logo")
      .populate("awayTeam", "name shortName slug logo")
      .lean();

    // Revalidate cache
    revalidateTag("standings", "default");
    revalidateTag("matches", "default");

    return {
      success: true,
      data: JSON.parse(JSON.stringify(updatedMatch)),
    };
  } catch (error) {
    console.error("[Matches Action] Error updating result:", error);
    return {
      success: false,
      error: "Nie udalo sie zapisac wyniku",
    };
  }
}

/**
 * Delete a match
 */
export async function deleteMatch(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await connectToDatabase();

    const match = await Match.findById(id);
    if (!match) {
      return {
        success: false,
        error: "Mecz nie zostal znaleziony",
      };
    }

    await Match.findByIdAndDelete(id);

    revalidateTag("matches", "default");
    revalidateTag("standings", "default");

    return {
      success: true,
    };
  } catch (error) {
    console.error("[Matches Action] Error deleting match:", error);
    return {
      success: false,
      error: "Nie udalo sie usunac meczu",
    };
  }
}
