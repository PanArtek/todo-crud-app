"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { loginSchema, LoginInput } from "@/lib/validations/auth";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginInput>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginInput, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name as keyof LoginInput]) {
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
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof LoginInput, string>> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as keyof LoginInput] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (response?.error) {
        setServerError("Nieprawidłowy email lub hasło");
        return;
      }

      router.push("/");
      router.refresh();
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
            Zaloguj się
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Witaj z powrotem w Ekstraklasa Tracker
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
              placeholder="Twoje hasło"
              autoComplete="current-password"
              disabled={isLoading}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-[var(--status-loss)]">
                {errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-[var(--accent-primary)] px-4 py-3 font-medium text-white transition-colors hover:bg-[var(--accent-primary)]/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Logowanie..." : "Zaloguj się"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
          Nie masz konta?{" "}
          <Link
            href="/register"
            className="font-medium text-[var(--accent-secondary)] hover:underline"
          >
            Zarejestruj się
          </Link>
        </p>
      </div>
    </div>
  );
}
