"use client";

import { useEffect, useState } from "react";
import { getMatchesForCurrentRound } from "@/app/actions/matches";
import { updateMatchResult } from "@/app/actions/matches";

interface Team {
  _id: string;
  name: string;
  shortName: string;
  logo?: string;
}

interface Match {
  _id: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number | null;
  awayScore: number | null;
  round: number;
  date: string;
  time?: string;
  status: string;
}

interface MatchScore {
  homeScore: string;
  awayScore: string;
}

export default function ResultsPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, MatchScore>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function fetchMatches() {
      setLoading(true);
      setError(null);

      const result = await getMatchesForCurrentRound();

      if (!isMounted) return;

      if (!result.success || !result.data) {
        setError(result.error || "Nie udalo sie pobrac meczow");
        setLoading(false);
        return;
      }

      const data = result.data as { matches: Match[]; currentRound: number };
      setMatches(data.matches);
      setCurrentRound(data.currentRound);

      // Initialize scores
      const initialScores: Record<string, MatchScore> = {};
      data.matches.forEach((match) => {
        initialScores[match._id] = {
          homeScore: match.homeScore !== null ? String(match.homeScore) : "",
          awayScore: match.awayScore !== null ? String(match.awayScore) : "",
        };
      });
      setScores(initialScores);

      setLoading(false);
    }

    fetchMatches();

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const reloadMatches = () => {
    setRefreshKey((k) => k + 1);
  };

  const handleScoreChange = (matchId: string, team: "home" | "away", value: string) => {
    // Only allow numbers
    if (value !== "" && !/^\d+$/.test(value)) return;

    setScores((prev) => {
      const current = prev[matchId] || { homeScore: "", awayScore: "" };
      return {
        ...prev,
        [matchId]: {
          ...current,
          [team === "home" ? "homeScore" : "awayScore"]: value,
        },
      };
    });
  };

  const handleSaveResult = async (matchId: string) => {
    const score = scores[matchId];
    if (!score || score.homeScore === "" || score.awayScore === "") {
      setSaveError("Wprowadz wynik dla obu druzyn");
      setTimeout(() => setSaveError(null), 3000);
      return;
    }

    setSavingId(matchId);
    setSaveError(null);
    setSaveSuccess(null);

    const result = await updateMatchResult(
      matchId,
      parseInt(score.homeScore, 10),
      parseInt(score.awayScore, 10)
    );

    if (result.success) {
      setSaveSuccess("Wynik zapisany!");
      setTimeout(() => setSaveSuccess(null), 3000);
      // Reload matches to update status
      reloadMatches();
    } else {
      setSaveError(result.error || "Nie udalo sie zapisac wyniku");
      setTimeout(() => setSaveError(null), 3000);
    }

    setSavingId(null);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pl-PL", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    });
  };

  const pendingMatches = matches.filter((m) => m.status !== "FINISHED");
  const finishedMatches = matches.filter((m) => m.status === "FINISHED");

  if (loading) {
    return (
      <div className="space-y-6 pb-20 lg:pb-0">
        <div className="h-8 w-48 animate-pulse rounded bg-[var(--bg-hover)]" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-48 animate-pulse bg-[var(--bg-hover)]" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-8 text-center">
        <p className="text-[var(--text-secondary)]">{error}</p>
        <button
          onClick={reloadMatches}
          className="mt-4 rounded-lg bg-[var(--accent-primary)] px-4 py-2 text-sm font-medium text-white"
        >
          Sprobuj ponownie
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>
          Wprowadz wyniki
        </h1>
        <p className="mt-1 text-[var(--text-secondary)]">
          Kolejka {currentRound} - {pendingMatches.length} meczow do rozegrania
        </p>
      </div>

      {/* Notifications */}
      {saveError && (
        <div className="rounded-lg bg-[var(--status-loss)]/20 p-4 text-sm text-[var(--status-loss)]">
          {saveError}
        </div>
      )}
      {saveSuccess && (
        <div className="rounded-lg bg-[var(--status-win)]/20 p-4 text-sm text-[var(--status-win)]">
          {saveSuccess}
        </div>
      )}

      {/* Pending Matches */}
      {pendingMatches.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-white">Do rozegrania</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pendingMatches.map((match) => (
              <MatchResultCard
                key={match._id}
                match={match}
                score={scores[match._id] || { homeScore: "", awayScore: "" }}
                onScoreChange={(team, value) => handleScoreChange(match._id, team, value)}
                onSave={() => handleSaveResult(match._id)}
                isSaving={savingId === match._id}
                formatDate={formatDate}
              />
            ))}
          </div>
        </div>
      )}

      {/* No pending matches */}
      {pendingMatches.length === 0 && matches.length > 0 && (
        <div className="card p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-[var(--status-win)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-white">Wszystkie mecze rozegrane!</h3>
          <p className="mt-2 text-[var(--text-secondary)]">
            Wszystkie mecze w kolejce {currentRound} maja wprowadzone wyniki.
          </p>
        </div>
      )}

      {/* No matches at all */}
      {matches.length === 0 && (
        <div className="card p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-[var(--text-muted)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-white">Brak meczow</h3>
          <p className="mt-2 text-[var(--text-secondary)]">
            W aktualnej kolejce nie ma zadnych meczow.
          </p>
        </div>
      )}

      {/* Finished Matches */}
      {finishedMatches.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-white">Zakonczone</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {finishedMatches.map((match) => (
              <div key={match._id} className="card p-4">
                <div className="mb-3 flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span>{formatDate(match.date)}</span>
                  <span className="rounded-full bg-[var(--status-win)]/20 px-2 py-0.5 text-[var(--status-win)]">
                    Zakonczony
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {match.homeTeam.logo ? (
                      <img src={match.homeTeam.logo} alt="" className="h-8 w-8 rounded-full bg-white/10 object-contain" />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-hover)] text-xs font-bold text-[var(--text-muted)]">
                        {match.homeTeam.shortName.slice(0, 2)}
                      </div>
                    )}
                    <span className="font-medium text-white">{match.homeTeam.shortName}</span>
                  </div>
                  <div className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>
                    {match.homeScore} - {match.awayScore}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{match.awayTeam.shortName}</span>
                    {match.awayTeam.logo ? (
                      <img src={match.awayTeam.logo} alt="" className="h-8 w-8 rounded-full bg-white/10 object-contain" />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-hover)] text-xs font-bold text-[var(--text-muted)]">
                        {match.awayTeam.shortName.slice(0, 2)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MatchResultCard({
  match,
  score,
  onScoreChange,
  onSave,
  isSaving,
  formatDate,
}: {
  match: Match;
  score: MatchScore;
  onScoreChange: (team: "home" | "away", value: string) => void;
  onSave: () => void;
  isSaving: boolean;
  formatDate: (date: string) => string;
}) {
  const isValid = score.homeScore !== "" && score.awayScore !== "";

  return (
    <div className="card p-4">
      {/* Date and Time */}
      <div className="mb-4 flex items-center justify-between text-xs text-[var(--text-muted)]">
        <span>{formatDate(match.date)}</span>
        {match.time && <span>{match.time}</span>}
      </div>

      {/* Teams and Score Inputs */}
      <div className="flex items-center justify-between gap-3">
        {/* Home Team */}
        <div className="flex flex-1 flex-col items-center gap-2">
          {match.homeTeam.logo ? (
            <img
              src={match.homeTeam.logo}
              alt={match.homeTeam.name}
              className="h-12 w-12 rounded-full bg-white/10 object-contain"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-hover)] text-sm font-bold text-[var(--text-muted)]">
              {match.homeTeam.shortName.slice(0, 2)}
            </div>
          )}
          <span className="text-center text-sm font-medium text-white">
            {match.homeTeam.shortName}
          </span>
        </div>

        {/* Score Inputs */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            inputMode="numeric"
            maxLength={2}
            value={score.homeScore}
            onChange={(e) => onScoreChange("home", e.target.value)}
            className="h-14 w-14 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-center text-2xl font-bold text-white focus:border-[var(--accent-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-secondary)]"
            placeholder="-"
          />
          <span className="text-xl font-bold text-[var(--text-muted)]">:</span>
          <input
            type="text"
            inputMode="numeric"
            maxLength={2}
            value={score.awayScore}
            onChange={(e) => onScoreChange("away", e.target.value)}
            className="h-14 w-14 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-center text-2xl font-bold text-white focus:border-[var(--accent-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-secondary)]"
            placeholder="-"
          />
        </div>

        {/* Away Team */}
        <div className="flex flex-1 flex-col items-center gap-2">
          {match.awayTeam.logo ? (
            <img
              src={match.awayTeam.logo}
              alt={match.awayTeam.name}
              className="h-12 w-12 rounded-full bg-white/10 object-contain"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-hover)] text-sm font-bold text-[var(--text-muted)]">
              {match.awayTeam.shortName.slice(0, 2)}
            </div>
          )}
          <span className="text-center text-sm font-medium text-white">
            {match.awayTeam.shortName}
          </span>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={onSave}
        disabled={!isValid || isSaving}
        className="mt-4 w-full rounded-lg bg-[var(--accent-primary)] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-primary)]/80 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSaving ? "Zapisywanie..." : "Zapisz wynik"}
      </button>
    </div>
  );
}
