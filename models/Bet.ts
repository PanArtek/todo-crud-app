import mongoose, { Schema, Document, Model, Types } from "mongoose";

/**
 * Bet prediction types (1X2)
 */
export const BET_PREDICTIONS = ["HOME", "DRAW", "AWAY"] as const;
export type BetPrediction = (typeof BET_PREDICTIONS)[number];

/**
 * Bet status types
 */
export const BET_STATUSES = [
  "OPEN",
  "WON",
  "LOST",
  "REFUNDED",
  "SETTLED",
] as const;
export type BetStatus = (typeof BET_STATUSES)[number];

/**
 * Odds snapshot at placement time
 */
export interface IOddsAtPlacement {
  home: number;
  draw: number;
  away: number;
}

/**
 * Bet document interface
 * All monetary values are in grosze (Polish cents)
 */
export interface IBet {
  userId: Types.ObjectId;
  matchId: Types.ObjectId;
  roundId: number;
  prediction: BetPrediction;
  stake: number; // grosze
  oddsVersion: number;
  oddsAtPlacement: IOddsAtPlacement;
  status: BetStatus;
  winnings?: number; // grosze (if WON)
  settledAt?: Date;
  wasCashedOut: boolean;
  cashedOutAt?: Date;
  cashedOutAmount?: number; // grosze
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Bet document with Mongoose methods
 */
export interface IBetDocument extends IBet, Document {
  _id: Types.ObjectId;
}

/**
 * Bet model type
 */
export type IBetModel = Model<IBetDocument>;

/**
 * Odds at placement subdocument schema
 */
const oddsAtPlacementSchema = new Schema<IOddsAtPlacement>(
  {
    home: {
      type: Number,
      required: [true, "Home odds required"],
      min: [1.01, "Odds must be at least 1.01"],
    },
    draw: {
      type: Number,
      required: [true, "Draw odds required"],
      min: [1.01, "Odds must be at least 1.01"],
    },
    away: {
      type: Number,
      required: [true, "Away odds required"],
      min: [1.01, "Odds must be at least 1.01"],
    },
  },
  { _id: false }
);

/**
 * Bet Schema
 * Represents a single bet placed by a user on a match
 */
const betSchema = new Schema<IBetDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    matchId: {
      type: Schema.Types.ObjectId,
      ref: "Match",
      required: [true, "Match ID is required"],
    },
    roundId: {
      type: Number,
      required: [true, "Round ID is required"],
      min: [1, "Round must be at least 1"],
      max: [38, "Round cannot exceed 38"],
    },
    prediction: {
      type: String,
      enum: {
        values: BET_PREDICTIONS,
        message: "Prediction must be HOME, DRAW, or AWAY",
      },
      required: [true, "Prediction is required"],
    },
    stake: {
      type: Number,
      required: [true, "Stake is required"],
      min: [10, "Minimum stake is 10 groszy (0.10 PLN)"],
      max: [1000000, "Maximum stake is 1,000,000 groszy (10,000 PLN)"],
      validate: {
        validator: Number.isInteger,
        message: "Stake must be an integer (grosze)",
      },
    },
    oddsVersion: {
      type: Number,
      required: [true, "Odds version is required"],
      min: 0,
    },
    oddsAtPlacement: {
      type: oddsAtPlacementSchema,
      required: [true, "Odds at placement are required"],
    },
    status: {
      type: String,
      enum: {
        values: BET_STATUSES,
        message: "Invalid bet status",
      },
      default: "OPEN",
    },
    winnings: {
      type: Number,
      min: [0, "Winnings cannot be negative"],
      validate: {
        validator: function (v: number | undefined) {
          return v === undefined || Number.isInteger(v);
        },
        message: "Winnings must be an integer (grosze)",
      },
    },
    settledAt: {
      type: Date,
    },
    wasCashedOut: {
      type: Boolean,
      default: false,
    },
    cashedOutAt: {
      type: Date,
    },
    cashedOutAmount: {
      type: Number,
      min: [0, "Cashout amount cannot be negative"],
      validate: {
        validator: function (v: number | undefined) {
          return v === undefined || Number.isInteger(v);
        },
        message: "Cashout amount must be an integer (grosze)",
      },
    },
  },
  {
    timestamps: true,
    collection: "bets",
  }
);

// Validation: WON status requires winnings
betSchema.pre("validate", function (this: IBetDocument) {
  if (this.status === "WON" && (this.winnings === undefined || this.winnings === null)) {
    this.invalidate("winnings", "Winnings are required when status is WON");
  }
});

// Validation: Cashout fields consistency
betSchema.pre("validate", function (this: IBetDocument) {
  if (this.wasCashedOut) {
    if (!this.cashedOutAt) {
      this.invalidate("cashedOutAt", "Cashout date is required when cashed out");
    }
    if (this.cashedOutAmount === undefined || this.cashedOutAmount === null) {
      this.invalidate("cashedOutAmount", "Cashout amount is required when cashed out");
    }
  }
});

// CONSTRAINT: One bet per user per match (unique compound index)
betSchema.index({ userId: 1, matchId: 1 }, { unique: true });

// Performance indexes
betSchema.index({ userId: 1, status: 1 });
betSchema.index({ matchId: 1, status: 1 });
betSchema.index({ roundId: 1, status: 1 });
betSchema.index({ userId: 1, createdAt: -1 });
betSchema.index({ status: 1, matchId: 1 }); // For settlement queries

/**
 * Bet Model
 * Uses mongoose.models to prevent recompilation during HMR
 */
const Bet: IBetModel =
  (mongoose.models.Bet as IBetModel) ||
  mongoose.model<IBetDocument, IBetModel>("Bet", betSchema);

export default Bet;
