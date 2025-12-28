import mongoose, { Schema, Document, Model, Types } from "mongoose";

/**
 * Recent form result types
 */
export const FORM_RESULTS = ["W", "L", "R"] as const; // Win, Loss, Refunded
export type FormResult = (typeof FORM_RESULTS)[number];

/**
 * UserRanking document interface
 * Stores computed ranking statistics for each user
 * All monetary values are in grosze (Polish cents)
 */
export interface IUserRanking {
  userId: Types.ObjectId;
  position: number;
  totalBets: number;
  wonBets: number;
  lostBets: number;
  refundedBets: number;
  totalStaked: number; // grosze
  totalWon: number; // grosze
  roi: number; // percentage (e.g., 15.5 means 15.5%)
  recentForm: FormResult[]; // last 5 results
  winRate: number; // percentage
  avgOdds: number;
  updatedAt: Date;
  version: number;
}

/**
 * UserRanking document with Mongoose methods
 */
export interface IUserRankingDocument extends IUserRanking, Document {
  _id: Types.ObjectId;
}

/**
 * UserRanking model type
 */
export type IUserRankingModel = Model<IUserRankingDocument>;

/**
 * UserRanking Schema
 * Computed ranking statistics - recalculated after each bet settlement
 */
const userRankingSchema = new Schema<IUserRankingDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      unique: true,
    },
    position: {
      type: Number,
      required: [true, "Position is required"],
      min: [1, "Position must be at least 1"],
    },
    totalBets: {
      type: Number,
      default: 0,
      min: 0,
    },
    wonBets: {
      type: Number,
      default: 0,
      min: 0,
    },
    lostBets: {
      type: Number,
      default: 0,
      min: 0,
    },
    refundedBets: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalStaked: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "Total staked must be an integer (grosze)",
      },
    },
    totalWon: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "Total won must be an integer (grosze)",
      },
    },
    roi: {
      type: Number,
      default: 0,
    },
    recentForm: {
      type: [String],
      enum: {
        values: FORM_RESULTS,
        message: "Form result must be W, L, or R",
      },
      default: [],
      validate: {
        validator: function (v: string[]) {
          return v.length <= 5;
        },
        message: "Recent form cannot exceed 5 entries",
      },
    },
    winRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    avgOdds: {
      type: Number,
      default: 1.0,
      min: 1.0,
    },
    version: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
    collection: "user_rankings",
  }
);

// Indexes for performance
userRankingSchema.index({ userId: 1 }, { unique: true });
userRankingSchema.index({ position: 1 });
userRankingSchema.index({ roi: -1 });
userRankingSchema.index({ totalWon: -1 });
userRankingSchema.index({ winRate: -1 });

/**
 * UserRanking Model
 * Uses mongoose.models to prevent recompilation during HMR
 */
const UserRanking: IUserRankingModel =
  (mongoose.models.UserRanking as IUserRankingModel) ||
  mongoose.model<IUserRankingDocument, IUserRankingModel>(
    "UserRanking",
    userRankingSchema
  );

export default UserRanking;
