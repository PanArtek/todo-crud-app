import mongoose, { Schema, Document, Model, Types } from "mongoose";

/**
 * Ledger entry types
 */
export const LEDGER_TYPES = [
  "DEPOSIT",
  "WITHDRAW",
  "BET_PLACED",
  "BET_WON",
  "BET_LOST",
  "BET_REFUNDED",
  "CASHOUT",
  "ADJUSTMENT",
] as const;
export type LedgerType = (typeof LEDGER_TYPES)[number];

/**
 * WalletLedger document interface
 * APPEND-ONLY ledger for wallet transactions
 * All amounts are in grosze (Polish cents)
 */
export interface IWalletLedger {
  userId: Types.ObjectId;
  type: LedgerType;
  amount: number; // grosze (positive or negative)
  description: string;
  betId?: Types.ObjectId;
  matchId?: Types.ObjectId;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  createdBy: Types.ObjectId;
}

/**
 * WalletLedger document with Mongoose methods
 */
export interface IWalletLedgerDocument extends IWalletLedger, Document {
  _id: Types.ObjectId;
}

/**
 * WalletLedger model type
 */
export type IWalletLedgerModel = Model<IWalletLedgerDocument>;

/**
 * WalletLedger Schema
 * APPEND-ONLY: Updates and deletes are blocked via middleware
 */
const walletLedgerSchema = new Schema<IWalletLedgerDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    type: {
      type: String,
      enum: {
        values: LEDGER_TYPES,
        message: "Invalid ledger type",
      },
      required: [true, "Ledger type is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      validate: {
        validator: Number.isInteger,
        message: "Amount must be an integer (grosze)",
      },
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    betId: {
      type: Schema.Types.ObjectId,
      ref: "Bet",
      sparse: true,
    },
    matchId: {
      type: Schema.Types.ObjectId,
      ref: "Match",
      sparse: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    createdAt: {
      type: Date,
      default: () => new Date(),
      immutable: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by user ID is required"],
    },
  },
  {
    timestamps: false, // We manage createdAt manually (immutable)
    collection: "wallet_ledger",
  }
);

// APPEND-ONLY: Block updates
walletLedgerSchema.pre("updateOne", function () {
  throw new Error("Cannot update WalletLedger - append-only!");
});
walletLedgerSchema.pre("findOneAndUpdate", function () {
  throw new Error("Cannot update WalletLedger - append-only!");
});
walletLedgerSchema.pre("updateMany", function () {
  throw new Error("Cannot update WalletLedger - append-only!");
});

// APPEND-ONLY: Block deletes (except for testing/admin purposes)
walletLedgerSchema.pre("deleteOne", function () {
  throw new Error("Cannot delete WalletLedger - append-only!");
});
walletLedgerSchema.pre("findOneAndDelete", function () {
  throw new Error("Cannot delete WalletLedger - append-only!");
});
walletLedgerSchema.pre("deleteMany", function () {
  throw new Error("Cannot delete WalletLedger - append-only!");
});

// Indexes for performance
walletLedgerSchema.index({ userId: 1, createdAt: -1 });
walletLedgerSchema.index({ betId: 1 });
walletLedgerSchema.index({ type: 1 });
walletLedgerSchema.index({ userId: 1, type: 1, createdAt: -1 });

/**
 * WalletLedger Model
 * Uses mongoose.models to prevent recompilation during HMR
 */
const WalletLedger: IWalletLedgerModel =
  (mongoose.models.WalletLedger as IWalletLedgerModel) ||
  mongoose.model<IWalletLedgerDocument, IWalletLedgerModel>(
    "WalletLedger",
    walletLedgerSchema
  );

export default WalletLedger;
