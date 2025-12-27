"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createMatch, updateMatch } from "@/app/actions/matches";

interface Team {
  _id: string;
  name: string;
  shortName: string;
  logo?: string;
}

interface MatchData {
  _id?: string;
  homeTeam?: { _id: string } | string;
  awayTeam?: { _id: string } | string;
  round?: number;
  season?: string;
  date?: string;
  time?: string;
  stadium?: string;
  status?: string;
}

interface MatchFormProps {
  match?: MatchData;
  teams: Team[];
  currentSeason: string;
  isEdit?: boolean;
}

export function MatchForm({ match, teams, currentSeason, isEdit = false }: MatchFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTeamId = (team: { _id: string } | string | undefined): string => {
    if (!team) return "";
    if (typeof team === "string") return team;
    return team._id;
  };

  const formatDateForInput = (dateStr?: string): string => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toISOString().split("T")[0] ?? "";
  };

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setError(null);

    const result = isEdit && match?._id
      ? await updateMatch(match._id, formData)
      : await createMatch(formData);

    if (result.success) {
      router.push("/admin/mecze");
      router.refresh();
    } else {
      setError(result.error || "Wystapil blad");
      setIsSubmitting(false);
    }
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-[var(--status-loss)]/20 p-4 text-sm text-[var(--status-loss)]">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Home Team */}
        <div>
          <label htmlFor="homeTeam" className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
            Gospodarz *
          </label>
          <select
            id="homeTeam"
            name="homeTeam"
            defaultValue={getTeamId(match?.homeTeam)}
            required
            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2.5 text-white focus:border-[var(--accent-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-secondary)]"
          >
            <option value="">Wybierz druzyne</option>
            {teams.map((team) => (
              <option key={team._id} value={team._id}>
                {team.name} ({team.shortName})
              </option>
            ))}
          </select>
        </div>

        {/* Away Team */}
        <div>
          <label htmlFor="awayTeam" className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
            Gosc *
          </label>
          <select
            id="awayTeam"
            name="awayTeam"
            defaultValue={getTeamId(match?.awayTeam)}
            required
            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2.5 text-white focus:border-[var(--accent-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-secondary)]"
          >
            <option value="">Wybierz druzyne</option>
            {teams.map((team) => (
              <option key={team._id} value={team._id}>
                {team.name} ({team.shortName})
              </option>
            ))}
          </select>
        </div>

        {/* Round */}
        <div>
          <label htmlFor="round" className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
            Kolejka *
          </label>
          <select
            id="round"
            name="round"
            defaultValue={match?.round || 1}
            required
            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2.5 text-white focus:border-[var(--accent-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-secondary)]"
          >
            {Array.from({ length: 34 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Kolejka {i + 1}
              </option>
            ))}
          </select>
        </div>

        {/* Season */}
        <div>
          <label htmlFor="season" className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
            Sezon *
          </label>
          <input
            type="text"
            id="season"
            name="season"
            defaultValue={match?.season || currentSeason}
            required
            pattern="\d{4}/\d{4}"
            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2.5 text-white placeholder-[var(--text-muted)] focus:border-[var(--accent-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-secondary)]"
            placeholder="2024/2025"
          />
        </div>

        {/* Date */}
        <div>
          <label htmlFor="date" className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
            Data *
          </label>
          <input
            type="date"
            id="date"
            name="date"
            defaultValue={formatDateForInput(match?.date)}
            required
            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2.5 text-white focus:border-[var(--accent-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-secondary)]"
          />
        </div>

        {/* Time */}
        <div>
          <label htmlFor="time" className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
            Godzina
          </label>
          <input
            type="time"
            id="time"
            name="time"
            defaultValue={match?.time}
            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2.5 text-white focus:border-[var(--accent-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-secondary)]"
          />
        </div>

        {/* Stadium */}
        <div className="md:col-span-2">
          <label htmlFor="stadium" className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
            Stadion
          </label>
          <input
            type="text"
            id="stadium"
            name="stadium"
            defaultValue={match?.stadium}
            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2.5 text-white placeholder-[var(--text-muted)] focus:border-[var(--accent-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-secondary)]"
            placeholder="np. Stadion Miejski"
          />
        </div>

        {/* Status (only for edit) */}
        {isEdit && (
          <div className="md:col-span-2">
            <label htmlFor="status" className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={match?.status || "SCHEDULED"}
              className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2.5 text-white focus:border-[var(--accent-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-secondary)]"
            >
              <option value="SCHEDULED">Zaplanowany</option>
              <option value="POSTPONED">Przelozony</option>
              <option value="CANCELLED">Anulowany</option>
            </select>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Aby ustawic status FINISHED, uzyj strony Wyniki
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 border-t border-[var(--border-color)] pt-6 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="rounded-lg bg-[var(--bg-hover)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--bg-hover)]/80 disabled:opacity-50"
        >
          Anuluj
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-[var(--accent-primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-primary)]/80 disabled:opacity-50"
        >
          {isSubmitting ? "Zapisywanie..." : isEdit ? "Zapisz zmiany" : "Dodaj mecz"}
        </button>
      </div>
    </form>
  );
}
