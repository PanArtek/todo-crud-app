import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * League document interface
 */
export interface ILeague {
  name: string;
  country: string;
  logo?: string;
  currentSeason: string;
  currentRound: number;
  totalRounds: number;
  teamsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * League document with Mongoose methods
 */
export interface ILeagueDocument extends ILeague, Document {
  _id: mongoose.Types.ObjectId;
}

/**
 * League model type
 */
export type ILeagueModel = Model<ILeagueDocument>;

/**
 * League Schema
 */
const leagueSchema = new Schema<ILeagueDocument>(
  {
    name: {
      type: String,
      required: [true, "League name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    country: {
      type: String,
      required: [true, "Country code is required"],
      uppercase: true,
      trim: true,
      minlength: [2, "Country code must be 2 characters"],
      maxlength: [3, "Country code cannot exceed 3 characters"],
    },
    logo: {
      type: String,
      trim: true,
    },
    currentSeason: {
      type: String,
      required: [true, "Current season is required"],
      match: [/^\d{4}\/\d{4}$/, "Season must be in format YYYY/YYYY (e.g., 2024/2025)"],
    },
    currentRound: {
      type: Number,
      required: [true, "Current round is required"],
      min: [1, "Round must be at least 1"],
      max: [38, "Round cannot exceed 38"],
      default: 1,
    },
    totalRounds: {
      type: Number,
      required: [true, "Total rounds is required"],
      min: [1, "Must have at least 1 round"],
      default: 34,
    },
    teamsCount: {
      type: Number,
      required: [true, "Teams count is required"],
      min: [2, "Must have at least 2 teams"],
      default: 18,
    },
  },
  {
    timestamps: true,
    collection: "leagues",
  }
);

// Indexes
leagueSchema.index({ name: 1, country: 1 }, { unique: true });
leagueSchema.index({ currentSeason: 1 });

/**
 * League Model
 * Uses mongoose.models to prevent recompilation during HMR
 */
const League: ILeagueModel =
  (mongoose.models.League as ILeagueModel) ||
  mongoose.model<ILeagueDocument, ILeagueModel>("League", leagueSchema);

export default League;
