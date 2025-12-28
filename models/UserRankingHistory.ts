import mongoose, { Schema, Document, Model, Types } from "mongoose";

/**
 * UserRankingHistory document interface
 * Stores historical snapshots of user ranking for charts/trends
 * All monetary values are in grosze (Polish cents)
 */
export interface IUserRankingHistory {
  userId: Types.ObjectId;
  date: Date;
  position: number;
  roi: number; // percentage
  totalWon: number; // grosze
  createdAt: Date;
}

/**
 * UserRankingHistory document with Mongoose methods
 */
export interface IUserRankingHistoryDocument
  extends IUserRankingHistory,
    Document {
  _id: Types.ObjectId;
}

/**
 * UserRankingHistory model type
 */
export type IUserRankingHistoryModel = Model<IUserRankingHistoryDocument>;

/**
 * UserRankingHistory Schema
 * Immutable historical records for tracking ranking changes over time
 */
const userRankingHistorySchema = new Schema<IUserRankingHistoryDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: () => new Date(),
    },
    position: {
      type: Number,
      required: [true, "Position is required"],
      min: [1, "Position must be at least 1"],
    },
    roi: {
      type: Number,
      required: [true, "ROI is required"],
    },
    totalWon: {
      type: Number,
      required: [true, "Total won is required"],
      validate: {
        validator: Number.isInteger,
        message: "Total won must be an integer (grosze)",
      },
    },
    createdAt: {
      type: Date,
      default: () => new Date(),
      immutable: true,
    },
  },
  {
    timestamps: false, // We manage createdAt manually (immutable)
    collection: "user_ranking_history",
  }
);

// Indexes for efficient queries
userRankingHistorySchema.index({ userId: 1, date: -1 });
userRankingHistorySchema.index({ date: -1 });
userRankingHistorySchema.index({ userId: 1, createdAt: -1 });

/**
 * UserRankingHistory Model
 * Uses mongoose.models to prevent recompilation during HMR
 */
const UserRankingHistory: IUserRankingHistoryModel =
  (mongoose.models.UserRankingHistory as IUserRankingHistoryModel) ||
  mongoose.model<IUserRankingHistoryDocument, IUserRankingHistoryModel>(
    "UserRankingHistory",
    userRankingHistorySchema
  );

export default UserRankingHistory;
