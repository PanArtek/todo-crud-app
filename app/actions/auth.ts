"use server";

import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { registerSchema } from "@/lib/validations/auth";

interface RegisterResult {
  success: boolean;
  error?: string;
}

/**
 * Server Action: Register a new user
 */
export async function registerUser(
  email: string,
  password: string,
  confirmPassword: string
): Promise<RegisterResult> {
  // Validate input
  const result = registerSchema.safeParse({ email, password, confirmPassword });
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message ?? "Nieprawidłowe dane",
    };
  }

  try {
    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return {
        success: false,
        error: "Użytkownik z tym adresem email już istnieje",
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with role USER
    await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "USER",
    });

    return { success: true };
  } catch (error) {
    console.error("[Auth] Registration error:", error);
    return {
      success: false,
      error: "Wystąpił błąd podczas rejestracji. Spróbuj ponownie.",
    };
  }
}
