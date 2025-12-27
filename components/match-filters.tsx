"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface Team {
  _id: string;
  name: string;
  shortName: string;
}

interface MatchFiltersProps {
  teams: Team[];
  selectedTeamId?: string;
  selectedStatus?: string;
}

export function MatchFilters({
  teams,
  selectedTeamId,
  selectedStatus,
}: MatchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/terminarz?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Team filter */}
      <div className="relative">
        <select
          value={selectedTeamId || ""}
          onChange={(e) => updateFilter("teamId", e.target.value)}
          className="h-10 appearance-none rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] pl-3 pr-10 text-sm text-white focus:border-[var(--accent-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-secondary)]"
        >
          <option value="">Wszystkie druzyny</option>
          {teams.map((team) => (
            <option key={team._id} value={team._id}>
              {team.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg
            className="h-4 w-4 text-[var(--text-muted)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] p-1">
        <StatusButton
          label="Wszystkie"
          selected={!selectedStatus}
          onClick={() => updateFilter("status", "")}
        />
        <StatusButton
          label="Rozegrane"
          selected={selectedStatus === "played"}
          onClick={() => updateFilter("status", "played")}
        />
        <StatusButton
          label="Nadchodzace"
          selected={selectedStatus === "upcoming"}
          onClick={() => updateFilter("status", "upcoming")}
        />
      </div>

      {/* Clear filters */}
      {(selectedTeamId || selectedStatus) && (
        <button
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString());
            params.delete("teamId");
            params.delete("status");
            router.push(`/terminarz?${params.toString()}`);
          }}
          className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors"
        >
          Wyczysc filtry
        </button>
      )}
    </div>
  );
}

function StatusButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
        selected
          ? "bg-[var(--accent-secondary)]/20 text-[var(--accent-secondary)]"
          : "text-[var(--text-secondary)] hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}
