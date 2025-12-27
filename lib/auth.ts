import NextAuth, { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

/**
 * NextAuth.js v5 Configuration
 * Uses CredentialsProvider with JWT strategy for Ekstraklasa Tracker
 */
export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await connectToDatabase();

          // Find user and explicitly select password field
          const user = await User.findOne({ email: credentials.email })
            .select("+password")
            .lean();

          if (!user || !user.password) {
            return null;
          }

          // Compare password with bcrypt hash
          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isValid) {
            return null;
          }

          // Return user object (without password)
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name ?? null,
            role: user.role,
          };
        } catch (error) {
          console.error("[Auth] Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add role to JWT token on initial sign in
      if (user) {
        token.id = user.id ?? "";
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Add role to session from JWT token
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "USER" | "ADMIN";
      }
      return session;
    },
  },
  trustHost: true,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
