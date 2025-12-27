import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/**
 * Requires admin role to access the route
 * Redirects to /login if not authenticated
 * Redirects to /unauthorized if not admin
 *
 * @returns Session with admin user
 */
export async function requireAdmin() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  return session;
}

/**
 * Requires authentication to access the route
 * Redirects to /login if not authenticated
 *
 * @returns Session with authenticated user
 */
export async function requireAuth() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return session;
}

/**
 * Gets the session if available, otherwise returns null
 * Does not redirect - use for optional auth checks
 *
 * @returns Session or null
 */
export async function getOptionalSession() {
  return await auth();
}
