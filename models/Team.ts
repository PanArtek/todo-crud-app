import mongoose, { Schema, Document, Model, Types } from "mongoose";

/**
 * Team colors interface
 */
export interface ITeamColors {
  primary: string;
  secondary: string;
}

/**
 * Team document interface
 */
export interface ITeam {
  leagueId: Types.ObjectId;
  name: string;
  shortName: string;
  slug: string;
  logo?: string;
  stadium?: string;
  city?: string;
  founded?: number;
  colors?: ITeamColors;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Team document with Mongoose methods
 */
export interface ITeamDocument extends ITeam, Document {
  _id: Types.ObjectId;
}

/**
 * Team model type
 */
export type ITeamModel = Model<ITeamDocument>;

/**
 * Team Colors Schema (subdocument)
 */
const teamColorsSchema = new Schema<ITeamColors>(
  {
    primary: {
      type: String,
      trim: true,
      match: [/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex code (e.g., #FF0000)"],
    },
    secondary: {
      type: String,
      trim: true,
      match: [/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex code (e.g., #FFFFFF)"],
    },
  },
  { _id: false }
);

/**
 * Team Schema
 */
const teamSchema = new Schema<ITeamDocument>(
  {
    leagueId: {
      type: Schema.Types.ObjectId,
      ref: "League",
      required: [true, "League ID is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Team name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    shortName: {
      type: String,
      required: [true, "Short name is required"],
      uppercase: true,
      trim: true,
      minlength: [2, "Short name must be at least 2 characters"],
      maxlength: [4, "Short name cannot exceed 4 characters"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"],
    },
    logo: {
      type: String,
      trim: true,
    },
    stadium: {
      type: String,
      trim: true,
      maxlength: [150, "Stadium name cannot exceed 150 characters"],
    },
    city: {
      type: String,
      trim: true,
      maxlength: [100, "City name cannot exceed 100 characters"],
    },
    founded: {
      type: Number,
      min: [1800, "Founded year must be after 1800"],
      max: [new Date().getFullYear(), "Founded year cannot be in the future"],
    },
    colors: {
      type: teamColorsSchema,
    },
  },
  {
    timestamps: true,
    collection: "teams",
  }
);

// Indexes (as specified in PRD)
teamSchema.index({ slug: 1 }, { unique: true });
teamSchema.index({ leagueId: 1 });
teamSchema.index({ name: "text", city: "text" }); // For search functionality

/**
 * Team Model
 * Uses mongoose.models to prevent recompilation during HMR
 */
const Team: ITeamModel =
  (mongoose.models.Team as ITeamModel) ||
  mongoose.model<ITeamDocument, ITeamModel>("Team", teamSchema);

export default Team;
