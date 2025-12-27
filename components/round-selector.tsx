"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface RoundSelectorProps {
  currentRound: number;
  selectedRound: number;
  totalRounds: number;
}

export function RoundSelector({
  currentRound,
  selectedRound,
  totalRounds,
}: RoundSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (round: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("round", round.toString());
      return params.toString();
    },
    [searchParams]
  );

  const goToRound = (round: number) => {
    if (round >= 1 && round <= totalRounds) {
      router.push(`/terminarz?${createQueryString(round)}`);
    }
  };

  const canGoPrev = selectedRound > 1;
  const canGoNext = selectedRound < totalRounds;

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => goToRound(selectedRound - 1)}
        disabled={!canGoPrev}
        className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Poprzednia kolejka"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="flex items-center gap-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] px-4 py-2">
        <span className="text-[var(--text-muted)] text-sm">Kolejka</span>
        <span
          className="text-xl font-bold text-white min-w-[2ch] text-center"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          {selectedRound}
        </span>
        {selectedRound === currentRound && (
          <span className="rounded-full bg-[var(--accent-primary)]/20 px-2 py-0.5 text-xs font-medium text-[var(--accent-primary)]">
            aktualna
          </span>
        )}
      </div>

      <button
        onClick={() => goToRound(selectedRound + 1)}
        disabled={!canGoNext}
        className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Nastepna kolejka"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {selectedRound !== currentRound && (
        <button
          onClick={() => goToRound(currentRound)}
          className="ml-2 rounded-lg bg-[var(--accent-primary)]/20 px-3 py-2 text-sm font-medium text-[var(--accent-primary)] transition-colors hover:bg-[var(--accent-primary)]/30"
        >
          Do aktualnej
        </button>
      )}
    </div>
  );
}
