import { Types } from "mongoose";

// Re-export model types
export type { IUser, IUserDocument, UserRole } from "@/models/User";
export type { ILeague, ILeagueDocument } from "@/models/League";
export type { ITeam, ITeamDocument, ITeamColors } from "@/models/Team";
export type {
  IMatch,
  IMatchDocument,
  ILiveData,
  ILiveEvent,
  MatchStatus,
  LiveEventType,
} from "@/models/Match";

// Re-export constants
export { USER_ROLES } from "@/models/User";
export { MATCH_STATUSES, LIVE_EVENT_TYPES } from "@/models/Match";

/**
 * Form result type (last 5 matches)
 */
export type FormResult = "W" | "D" | "L";

/**
 * Team info for standings (populated data)
 */
export interface TeamInfo {
  _id: Types.ObjectId;
  name: string;
  shortName: string;
  slug: string;
  logo?: string;
}

/**
 * Standing interface
 * ⚠️ This is a PROJECTION calculated from Match collection
 * NOT a Mongoose model - never stored in database!
 */
export interface Standing {
  team: TeamInfo;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: FormResult[];
}

/**
 * Match with populated teams (for API responses)
 */
export interface MatchWithTeams {
  _id: Types.ObjectId;
  leagueId: Types.ObjectId;
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
  homeScore: number | null;
  awayScore: number | null;
  round: number;
  season: string;
  date: Date;
  time?: string;
  stadium?: string;
  status: "SCHEDULED" | "LIVE" | "FINISHED" | "POSTPONED" | "CANCELLED";
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
  };
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Match filter parameters
 */
export interface MatchFilters {
  season?: string;
  round?: number;
  teamId?: string;
  status?: "SCHEDULED" | "LIVE" | "FINISHED" | "POSTPONED" | "CANCELLED";
}
