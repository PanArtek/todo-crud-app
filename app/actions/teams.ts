"use server";

import { revalidateTag } from "next/cache";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth-utils";
import Team from "@/models/Team";
import Match from "@/models/Match";
import League from "@/models/League";
import { createTeamSchema, updateTeamSchema } from "@/lib/validations/team";

interface ActionResult {
  success: boolean;
  error?: string;
  data?: unknown;
}

/**
 * Generate slug from team name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Remove consecutive hyphens
    .trim();
}

/**
 * Get all teams
 */
export async function getTeams(): Promise<ActionResult> {
  try {
    await connectToDatabase();
    const teams = await Team.find().sort({ name: 1 }).lean();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(teams)),
    };
  } catch (error) {
    console.error("[Teams Action] Error getting teams:", error);
    return {
      success: false,
      error: "Nie udało się pobrać drużyn",
    };
  }
}

/**
 * Get single team by ID
 */
export async function getTeamById(id: string): Promise<ActionResult> {
  try {
    await connectToDatabase();
    const team = await Team.findById(id).lean();

    if (!team) {
      return {
        success: false,
        error: "Drużyna nie została znaleziona",
      };
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(team)),
    };
  } catch (error) {
    console.error("[Teams Action] Error getting team:", error);
    return {
      success: false,
      error: "Nie udało się pobrać drużyny",
    };
  }
}

/**
 * Create a new team
 */
export async function createTeam(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    await connectToDatabase();

    // Get league ID (Ekstraklasa)
    const league = await League.findOne({ country: "PL" }).select("_id").lean();
    if (!league) {
      return {
        success: false,
        error: "Liga nie została znaleziona",
      };
    }

    // Parse form data
    const name = formData.get("name") as string;
    const shortName = formData.get("shortName") as string;
    const slug = formData.get("slug") as string || generateSlug(name);
    const stadium = formData.get("stadium") as string;
    const city = formData.get("city") as string;
    const founded = formData.get("founded") ? Number(formData.get("founded")) : undefined;
    const logo = formData.get("logo") as string;
    const colorPrimary = formData.get("colors.primary") as string;
    const colorSecondary = formData.get("colors.secondary") as string;

    const input = {
      leagueId: league._id.toString(),
      name,
      shortName,
      slug,
      stadium: stadium || undefined,
      city: city || undefined,
      founded,
      logo: logo || undefined,
      colors: colorPrimary || colorSecondary
        ? {
            primary: colorPrimary || undefined,
            secondary: colorSecondary || undefined,
          }
        : undefined,
    };

    // Validate
    const result = createTeamSchema.safeParse(input);
    if (!result.success) {
      return {
        success: false,
        error: result.error.issues[0]?.message ?? "Nieprawidłowe dane",
      };
    }

    // Check if slug already exists
    const existingTeam = await Team.findOne({ slug: result.data.slug });
    if (existingTeam) {
      return {
        success: false,
        error: "Drużyna o tym slug już istnieje",
      };
    }

    // Create team
    const team = await Team.create(result.data);

    revalidateTag("teams", "default");

    return {
      success: true,
      data: JSON.parse(JSON.stringify(team)),
    };
  } catch (error) {
    console.error("[Teams Action] Error creating team:", error);
    return {
      success: false,
      error: "Nie udało się utworzyć drużyny",
    };
  }
}

/**
 * Update a team
 */
export async function updateTeam(id: string, formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    await connectToDatabase();

    const team = await Team.findById(id);
    if (!team) {
      return {
        success: false,
        error: "Drużyna nie została znaleziona",
      };
    }

    // Parse form data
    const name = formData.get("name") as string;
    const shortName = formData.get("shortName") as string;
    const slug = formData.get("slug") as string;
    const stadium = formData.get("stadium") as string;
    const city = formData.get("city") as string;
    const founded = formData.get("founded") ? Number(formData.get("founded")) : undefined;
    const logo = formData.get("logo") as string;
    const colorPrimary = formData.get("colors.primary") as string;
    const colorSecondary = formData.get("colors.secondary") as string;

    const input = {
      name: name || undefined,
      shortName: shortName || undefined,
      slug: slug || undefined,
      stadium: stadium || undefined,
      city: city || undefined,
      founded,
      logo: logo || undefined,
      colors: colorPrimary || colorSecondary
        ? {
            primary: colorPrimary || undefined,
            secondary: colorSecondary || undefined,
          }
        : undefined,
    };

    // Validate
    const result = updateTeamSchema.safeParse(input);
    if (!result.success) {
      return {
        success: false,
        error: result.error.issues[0]?.message ?? "Nieprawidłowe dane",
      };
    }

    // Check if slug already exists (if changing)
    if (result.data.slug && result.data.slug !== team.slug) {
      const existingTeam = await Team.findOne({ slug: result.data.slug });
      if (existingTeam) {
        return {
          success: false,
          error: "Drużyna o tym slug już istnieje",
        };
      }
    }

    // Update team
    const updatedTeam = await Team.findByIdAndUpdate(
      id,
      { $set: result.data },
      { new: true }
    ).lean();

    revalidateTag("teams", "default");
    revalidateTag("standings", "default");

    return {
      success: true,
      data: JSON.parse(JSON.stringify(updatedTeam)),
    };
  } catch (error) {
    console.error("[Teams Action] Error updating team:", error);
    return {
      success: false,
      error: "Nie udało się zaktualizować drużyny",
    };
  }
}

/**
 * Delete a team
 */
export async function deleteTeam(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await connectToDatabase();

    const team = await Team.findById(id);
    if (!team) {
      return {
        success: false,
        error: "Drużyna nie została znaleziona",
      };
    }

    // Check if team has any matches
    const matchCount = await Match.countDocuments({
      $or: [{ homeTeam: id }, { awayTeam: id }],
    });

    if (matchCount > 0) {
      return {
        success: false,
        error: `Nie można usunąć drużyny, która ma ${matchCount} ${matchCount === 1 ? "mecz" : "meczów"}. Najpierw usuń mecze.`,
      };
    }

    await Team.findByIdAndDelete(id);

    revalidateTag("teams", "default");

    return {
      success: true,
    };
  } catch (error) {
    console.error("[Teams Action] Error deleting team:", error);
    return {
      success: false,
      error: "Nie udało się usunąć drużyny",
    };
  }
}
