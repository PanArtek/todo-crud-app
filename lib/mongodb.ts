import mongoose from "mongoose";

/**
 * MongoDB Connection Module
 *
 * Implements singleton pattern with connection caching for Next.js.
 * In development, the connection is cached in `global` to survive HMR.
 * In production, a single connection is reused across requests.
 */

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI is not defined. Please add it to your .env.local file.\n" +
      "Example: MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<database>"
  );
}

/**
 * Global type declaration for caching mongoose connection
 * Prevents multiple connections during Next.js hot reloads
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

if (process.env.NODE_ENV === "development") {
  global.mongooseCache = cached;
}

/**
 * MongoDB connection options
 * Configured for optimal performance with connection pooling
 */
const connectionOptions: mongoose.ConnectOptions = {
  bufferCommands: false,
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

/**
 * Establishes connection to MongoDB with caching
 *
 * @returns Promise<typeof mongoose> - Mongoose instance
 * @throws Error if connection fails
 *
 * @example
 * ```ts
 * import { connectToDatabase } from "@/lib/mongodb";
 *
 * export async function GET() {
 *   await connectToDatabase();
 *   const users = await User.find();
 *   return Response.json(users);
 * }
 * ```
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  // Return cached connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection is in progress, wait for it
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, connectionOptions)
      .then((mongooseInstance) => {
        console.log("[MongoDB] Connected successfully");
        return mongooseInstance;
      })
      .catch((error: Error) => {
        cached.promise = null;
        throw new Error(
          `[MongoDB] Connection failed: ${error.message}\n` +
            "Please check:\n" +
            "  1. MONGODB_URI is correct\n" +
            "  2. IP whitelist in MongoDB Atlas includes your IP\n" +
            "  3. Database user credentials are valid"
        );
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

/**
 * Disconnects from MongoDB
 * Useful for graceful shutdown or testing
 */
export async function disconnectFromDatabase(): Promise<void> {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log("[MongoDB] Disconnected");
  }
}

/**
 * Returns current connection state
 */
export function getConnectionState(): string {
  const states: Record<number, string> = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  return states[mongoose.connection.readyState] ?? "unknown";
}

export default connectToDatabase;
