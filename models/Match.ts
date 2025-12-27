import mongoose, { Schema, Document, Model, Types } from "mongoose";

/**
 * Match status enum
 * JEDYNE ŹRÓDŁO PRAWDY dla statusów meczów
 */
export const MATCH_STATUSES = [
  "SCHEDULED",
  "LIVE",
  "FINISHED",
  "POSTPONED",
  "CANCELLED",
] as const;
export type MatchStatus = (typeof MATCH_STATUSES)[number];

/**
 * Live event types
 */
export const LIVE_EVENT_TYPES = ["GOAL", "YELLOW", "RED", "SUBSTITUTION"] as const;
export type LiveEventType = (typeof LIVE_EVENT_TYPES)[number];

/**
 * Live event interface
 */
export interface ILiveEvent {
  type: LiveEventType;
  minute: number;
  team: "home" | "away";
  player?: string;
}

/**
 * Live data interface (for future LIVE functionality)
 */
export interface ILiveData {
  minute?: number;
  events: ILiveEvent[];
}

/**
 * Match document interface
 * This is the SINGLE SOURCE OF TRUTH for match results
 */
export interface IMatch {
  leagueId: Types.ObjectId;
  homeTeam: Types.ObjectId;
  awayTeam: Types.ObjectId;
  homeScore: number | null;
  awayScore: number | null;
  round: number;
  season: string;
  date: Date;
  time?: string;
  stadium?: string;
  status: MatchStatus;
  liveData?: ILiveData;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Match document with Mongoose methods
 */
export interface IMatchDocument extends IMatch, Document {
  _id: Types.ObjectId;
}

/**
 * Match model type
 */
export type IMatchModel = Model<IMatchDocument>;

/**
 * Live Event Schema (subdocument)
 */
const liveEventSchema = new Schema<ILiveEvent>(
  {
    type: {
      type: String,
      enum: LIVE_EVENT_TYPES,
      required: true,
    },
    minute: {
      type: Number,
      required: true,
      min: 0,
      max: 120,
    },
    team: {
      type: String,
      enum: ["home", "away"],
      required: true,
    },
    player: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

/**
 * Live Data Schema (subdocument)
 */
const liveDataSchema = new Schema<ILiveData>(
  {
    minute: {
      type: Number,
      min: 0,
      max: 120,
    },
    events: {
      type: [liveEventSchema],
      default: [],
    },
  },
  { _id: false }
);

/**
 * Match Schema
 * JEDYNE ŹRÓDŁO PRAWDY dla wyników meczów
 * Tabela ligowa jest ZAWSZE wyliczana z tej kolekcji
 */
const matchSchema = new Schema<IMatchDocument>(
  {
    leagueId: {
      type: Schema.Types.ObjectId,
      ref: "League",
      required: [true, "League ID is required"],
    },
    homeTeam: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: [true, "Home team is required"],
    },
    awayTeam: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: [true, "Away team is required"],
    },
    homeScore: {
      type: Number,
      default: null,
      min: [0, "Score cannot be negative"],
      max: [99, "Score cannot exceed 99"],
    },
    awayScore: {
      type: Number,
      default: null,
      min: [0, "Score cannot be negative"],
      max: [99, "Score cannot exceed 99"],
    },
    round: {
      type: Number,
      required: [true, "Round is required"],
      min: [1, "Round must be at least 1"],
      max: [38, "Round cannot exceed 38"],
    },
    season: {
      type: String,
      required: [true, "Season is required"],
      match: [/^\d{4}\/\d{4}$/, "Season must be in format YYYY/YYYY (e.g., 2024/2025)"],
    },
    date: {
      type: Date,
      required: [true, "Match date is required"],
    },
    time: {
      type: String,
      trim: true,
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:MM format"],
    },
    stadium: {
      type: String,
      trim: true,
      maxlength: [150, "Stadium name cannot exceed 150 characters"],
    },
    status: {
      type: String,
      enum: {
        values: MATCH_STATUSES,
        message: "Invalid match status",
      },
      default: "SCHEDULED",
    },
    liveData: {
      type: liveDataSchema,
    },
  },
  {
    timestamps: true,
    collection: "matches",
  }
);

// Validation: homeTeam !== awayTeam
matchSchema.pre("validate", function (next) {
  if (this.homeTeam && this.awayTeam && this.homeTeam.equals(this.awayTeam)) {
    this.invalidate("awayTeam", "Home team and away team cannot be the same");
  }
  next();
});

// Validation: FINISHED status requires scores
matchSchema.pre("validate", function (next) {
  if (this.status === "FINISHED") {
    if (this.homeScore === null || this.awayScore === null) {
      this.invalidate("status", "Cannot set status to FINISHED without scores");
    }
  }
  next();
});

// Indexes (as specified in PRD - critical for standings aggregation!)
matchSchema.index({ season: 1, round: 1 });
matchSchema.index({ homeTeam: 1, season: 1 });
matchSchema.index({ awayTeam: 1, season: 1 });
matchSchema.index({ status: 1, date: 1 });
matchSchema.index({ leagueId: 1, season: 1 });

// Compound index for efficient team match lookup
matchSchema.index({ season: 1, homeTeam: 1, awayTeam: 1 });

/**
 * Match Model
 * Uses mongoose.models to prevent recompilation during HMR
 */
const Match: IMatchModel =
  (mongoose.models.Match as IMatchModel) ||
  mongoose.model<IMatchDocument, IMatchModel>("Match", matchSchema);

export default Match;
