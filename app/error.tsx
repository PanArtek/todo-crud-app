"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
      <div className="card max-w-md p-8 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--status-loss)]/10">
          <svg
            className="h-8 w-8 text-[var(--status-loss)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1
          className="text-2xl font-bold text-white"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          Coś poszło nie tak
        </h1>

        <p className="mt-3 text-[var(--text-secondary)]">
          Wystąpił nieoczekiwany błąd. Spróbuj odświeżyć stronę lub wrócić do
          strony głównej.
        </p>

        {error.digest && (
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            Kod błędu: {error.digest}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="rounded-lg bg-[var(--accent-primary)] px-6 py-3 font-medium text-white transition-colors hover:bg-[var(--accent-primary)]/90"
          >
            Spróbuj ponownie
          </button>
          <button
            onClick={() => router.push("/")}
            className="rounded-lg border border-[var(--border-color)] px-6 py-3 font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-white"
          >
            Strona główna
          </button>
        </div>
      </div>
    </div>
  );
}
