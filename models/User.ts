import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * User roles
 */
export const USER_ROLES = ["USER", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];

/**
 * User document interface
 */
export interface IUser {
  email: string;
  password: string;
  name?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User document with Mongoose methods
 */
export interface IUserDocument extends IUser, Document {
  _id: mongoose.Types.ObjectId;
}

/**
 * User model type
 */
export type IUserModel = Model<IUserDocument>;

/**
 * User Schema
 */
const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't include password in queries by default
    },
    name: {
      type: String,
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    role: {
      type: String,
      enum: {
        values: USER_ROLES,
        message: "Role must be USER or ADMIN",
      },
      default: "USER",
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });

/**
 * User Model
 * Uses mongoose.models to prevent recompilation during HMR
 */
const User: IUserModel =
  (mongoose.models.User as IUserModel) ||
  mongoose.model<IUserDocument, IUserModel>("User", userSchema);

export default User;
