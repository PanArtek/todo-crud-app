import mongoose, { Schema, Document, Model, Types } from "mongoose";

/**
 * Wallet document interface
 * Stores user balance in grosze (Polish cents) as integers for precision
 */
export interface IWallet {
  userId: Types.ObjectId;
  balance: number; // grosze (integer)
  version: number; // optimistic locking
  lastRecalcAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Wallet document with Mongoose methods
 */
export interface IWalletDocument extends IWallet, Document {
  _id: Types.ObjectId;
}

/**
 * Wallet model type
 */
export type IWalletModel = Model<IWalletDocument>;

/**
 * Wallet Schema
 * Balance is stored in grosze (1 PLN = 100 groszy) to avoid floating point issues
 */
const walletSchema = new Schema<IWalletDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      unique: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: [0, "Balance cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Balance must be an integer (grosze)",
      },
    },
    version: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastRecalcAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  {
    timestamps: true,
    collection: "wallets",
  }
);

// Indexes
walletSchema.index({ userId: 1 }, { unique: true });

/**
 * Wallet Model
 * Uses mongoose.models to prevent recompilation during HMR
 */
const Wallet: IWalletModel =
  (mongoose.models.Wallet as IWalletModel) ||
  mongoose.model<IWalletDocument, IWalletModel>("Wallet", walletSchema);

export default Wallet;
