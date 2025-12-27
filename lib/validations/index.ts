/**
 * Validation Schemas Index
 *
 * Re-exports all Zod validation schemas.
 */

// Match schemas
export {
  matchStatusSchema,
  createMatchSchema,
  updateMatchSchema,
  updateResultSchema,
  type CreateMatchInput,
  type UpdateMatchInput,
  type UpdateResultInput,
} from "./match";

// Team schemas
export {
  createTeamSchema,
  updateTeamSchema,
  type CreateTeamInput,
  type UpdateTeamInput,
} from "./team";

// League schemas
export {
  updateCurrentRoundSchema,
  createLeagueSchema,
  updateLeagueSchema,
  type UpdateCurrentRoundInput,
  type CreateLeagueInput,
  type UpdateLeagueInput,
} from "./league";
