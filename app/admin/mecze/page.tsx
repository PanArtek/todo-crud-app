"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getMatches } from "@/app/actions/matches";
import { getLeagueInfo } from "@/app/actions/league";
import { DeleteMatchButton } from "@/components/admin/delete-match-button";

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
  stadium?: string;
  status: string;
}

interface LeagueInfo {
  currentRound: number;
  totalRounds: number;
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [league, setLeague] = useState<LeagueInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roundFilter, setRoundFilter] = useState<number | "all">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      const [matchesResult, leagueResult] = await Promise.all([
        getMatches(),
        getLeagueInfo(),
      ]);

      if (!matchesResult.success) {
        setError(matchesResult.error || "Nie udalo sie pobrac meczow");
        setLoading(false);
        return;
      }

      if (leagueResult.success && leagueResult.data) {
        setLeague(leagueResult.data as LeagueInfo);
      }

      setMatches(matchesResult.data as Match[]);
      setLoading(false);
    }

    loadData();
  }, []);

  const filteredMatches = matches.filter((match) => {
    if (roundFilter !== "all" && match.round !== roundFilter) return false;
    if (statusFilter !== "all" && match.status !== statusFilter) return false;
    return true;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      SCHEDULED: "bg-[var(--accent-secondary)]/20 text-[var(--accent-secondary)]",
      LIVE: "bg-[var(--status-loss)]/20 text-[var(--status-loss)] animate-pulse-live",
      FINISHED: "bg-[var(--status-win)]/20 text-[var(--status-win)]",
      POSTPONED: "bg-yellow-500/20 text-yellow-500",
      CANCELLED: "bg-[var(--text-muted)]/20 text-[var(--text-muted)]",
    };
    const labels: Record<string, string> = {
      SCHEDULED: "Zaplanowany",
      LIVE: "Na zywo",
      FINISHED: "Zakonczony",
      POSTPONED: "Przełozony",
      CANCELLED: "Anulowany",
    };
    return (
      <span className={`rounded-full px-2 py-1 text-xs font-medium ${styles[status] || ""}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-20 lg:pb-0">
        <div className="flex items-center justify-between">
          <div className="h-8 w-32 animate-pulse rounded bg-[var(--bg-hover)]" />
          <div className="h-10 w-32 animate-pulse rounded bg-[var(--bg-hover)]" />
        </div>
        <div className="card p-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded bg-[var(--bg-hover)]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-8 text-center">
        <p className="text-[var(--text-secondary)]">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>
            Mecze
          </h1>
          <p className="mt-1 text-[var(--text-secondary)]">
            {matches.length} meczow w sezonie
          </p>
        </div>
        <Link
          href="/admin/mecze/nowy"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--accent-primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-primary)]/80"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Dodaj mecz
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="mb-1 block text-xs text-[var(--text-muted)]">Kolejka</label>
          <select
            value={roundFilter}
            onChange={(e) => setRoundFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
            className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-white focus:border-[var(--accent-secondary)] focus:outline-none"
          >
            <option value="all">Wszystkie</option>
            {league && Array.from({ length: league.totalRounds }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Kolejka {i + 1} {i + 1 === league.currentRound ? "(aktualna)" : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-[var(--text-muted)]">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-white focus:border-[var(--accent-secondary)] focus:outline-none"
          >
            <option value="all">Wszystkie</option>
            <option value="SCHEDULED">Zaplanowane</option>
            <option value="FINISHED">Zakonczone</option>
            <option value="LIVE">Na zywo</option>
            <option value="POSTPONED">Przelozone</option>
            <option value="CANCELLED">Anulowane</option>
          </select>
        </div>
      </div>

      {/* Matches List */}
      {filteredMatches.length === 0 ? (
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
            {matches.length === 0 ? "Dodaj pierwszy mecz do terminarza." : "Brak meczow spelniajacych kryteria."}
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Kol.
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Mecz
                  </th>
                  <th className="hidden px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] sm:table-cell">
                    Wynik
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] md:table-cell">
                    Data
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {filteredMatches.map((match) => (
                  <tr key={match._id} className="table-row-hover">
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="rounded bg-[var(--bg-hover)] px-2 py-1 text-xs font-medium text-[var(--text-secondary)]">
                        {match.round}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <TeamBadge team={match.homeTeam} />
                        <span className="text-[var(--text-muted)]">vs</span>
                        <TeamBadge team={match.awayTeam} />
                      </div>
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 text-center sm:table-cell">
                      {match.status === "FINISHED" || match.status === "LIVE" ? (
                        <span className="font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>
                          {match.homeScore} - {match.awayScore}
                        </span>
                      ) : (
                        <span className="text-[var(--text-muted)]">-</span>
                      )}
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 text-[var(--text-secondary)] md:table-cell">
                      {formatDate(match.date)}
                      {match.time && <span className="ml-2 text-[var(--text-muted)]">{match.time}</span>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {getStatusBadge(match.status)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/mecze/${match._id}`}
                          className="rounded-lg p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-white"
                          title="Edytuj"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <DeleteMatchButton matchId={match._id} homeTeam={match.homeTeam.name} awayTeam={match.awayTeam.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function TeamBadge({ team }: { team: Team }) {
  return (
    <div className="flex items-center gap-2">
      {team.logo ? (
        <img src={team.logo} alt={team.name} className="h-6 w-6 rounded-full bg-white/10 object-contain" />
      ) : (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--bg-hover)] text-xs font-bold text-[var(--text-muted)]">
          {team.shortName.slice(0, 2)}
        </div>
      )}
      <span className="hidden font-medium text-white sm:inline">{team.name}</span>
      <span className="font-medium text-white sm:hidden">{team.shortName}</span>
    </div>
  );
}
