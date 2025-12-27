"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerSchema, RegisterInput } from "@/lib/validations/auth";
import { registerUser } from "@/app/actions/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterInput>({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterInput, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name as keyof RegisterInput]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (serverError) {
      setServerError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    // Validate with Zod
    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof RegisterInput, string>> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as keyof RegisterInput] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await registerUser(
        formData.email,
        formData.password,
        formData.confirmPassword
      );

      if (!response.success) {
        setServerError(response.error || "Wystąpił błąd podczas rejestracji");
        return;
      }

      // Redirect to login on success
      router.push("/login?registered=true");
    } catch {
      setServerError("Wystąpił błąd serwera. Spróbuj ponownie.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
      <div className="card w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Utwórz konto
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Dołącz do Ekstraklasa Tracker
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {serverError && (
            <div className="rounded-lg bg-[var(--status-loss)]/10 p-3 text-sm text-[var(--status-loss)]">
              {serverError}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-[var(--text-secondary)]"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full rounded-lg border bg-[var(--bg-secondary)] px-4 py-3 text-white placeholder-[var(--text-muted)] transition-colors focus:border-[var(--accent-secondary)] focus:outline-none ${
                errors.email
                  ? "border-[var(--status-loss)]"
                  : "border-[var(--border-color)]"
              }`}
              placeholder="twoj@email.pl"
              autoComplete="email"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-[var(--status-loss)]">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-[var(--text-secondary)]"
            >
              Hasło
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full rounded-lg border bg-[var(--bg-secondary)] px-4 py-3 text-white placeholder-[var(--text-muted)] transition-colors focus:border-[var(--accent-secondary)] focus:outline-none ${
                errors.password
                  ? "border-[var(--status-loss)]"
                  : "border-[var(--border-color)]"
              }`}
              placeholder="Min. 8 znaków"
              autoComplete="new-password"
              disabled={isLoading}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-[var(--status-loss)]">
                {errors.password}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-[var(--text-secondary)]"
            >
              Potwierdź hasło
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full rounded-lg border bg-[var(--bg-secondary)] px-4 py-3 text-white placeholder-[var(--text-muted)] transition-colors focus:border-[var(--accent-secondary)] focus:outline-none ${
                errors.confirmPassword
                  ? "border-[var(--status-loss)]"
                  : "border-[var(--border-color)]"
              }`}
              placeholder="Powtórz hasło"
              autoComplete="new-password"
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-[var(--status-loss)]">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-[var(--accent-primary)] px-4 py-3 font-medium text-white transition-colors hover:bg-[var(--accent-primary)]/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Rejestracja..." : "Zarejestruj się"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
          Masz już konto?{" "}
          <Link
            href="/login"
            className="font-medium text-[var(--accent-secondary)] hover:underline"
          >
            Zaloguj się
          </Link>
        </p>
      </div>
    </div>
  );
}
