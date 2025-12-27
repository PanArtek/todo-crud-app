import Link from "next/link";
import { notFound } from "next/navigation";
import { getMatchById } from "@/app/actions/matches";
import { getTeams } from "@/app/actions/teams";
import { getLeagueInfo } from "@/app/actions/league";
import { MatchForm } from "@/components/admin/match-form";

interface Team {
  _id: string;
  name: string;
  shortName: string;
  logo?: string;
}

interface MatchTeam {
  _id: string;
  name: string;
  shortName: string;
  logo?: string;
}

interface Match {
  _id: string;
  homeTeam: MatchTeam;
  awayTeam: MatchTeam;
  round: number;
  season: string;
  date: string;
  time?: string;
  stadium?: string;
  status: string;
}

interface LeagueInfo {
  currentSeason: string;
}

interface EditMatchPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditMatchPage({ params }: EditMatchPageProps) {
  const { id } = await params;

  const [matchResult, teamsResult, leagueResult] = await Promise.all([
    getMatchById(id),
    getTeams(),
    getLeagueInfo(),
  ]);

  if (!matchResult.success || !matchResult.data) {
    notFound();
  }

  if (!teamsResult.success || !teamsResult.data) {
    return (
      <div className="card p-8 text-center">
        <p className="text-[var(--text-secondary)]">
          {teamsResult.error || "Nie udalo sie pobrac druzyn"}
        </p>
      </div>
    );
  }

  const match = matchResult.data as Match;
  const teams = teamsResult.data as Team[];
  const league = leagueResult.data as LeagueInfo | null;
  const currentSeason = league?.currentSeason || "2024/2025";

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/mecze"
          className="rounded-lg p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-white"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>
            Edytuj mecz
          </h1>
          <p className="mt-1 text-[var(--text-secondary)]">
            {match.homeTeam.name} vs {match.awayTeam.name} - Kolejka {match.round}
          </p>
        </div>
      </div>

      {/* Match Preview */}
      <div className="card p-4">
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2 text-right">
            {match.homeTeam.logo ? (
              <img
                src={match.homeTeam.logo}
                alt={match.homeTeam.name}
                className="h-10 w-10 rounded-full bg-white/10 object-contain"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bg-hover)] text-sm font-bold text-[var(--text-muted)]">
                {match.homeTeam.shortName.slice(0, 2)}
              </div>
            )}
            <span className="font-medium text-white">{match.homeTeam.shortName}</span>
          </div>
          <span className="text-2xl font-bold text-[var(--text-muted)]">vs</span>
          <div className="flex items-center gap-2">
            <span className="font-medium text-white">{match.awayTeam.shortName}</span>
            {match.awayTeam.logo ? (
              <img
                src={match.awayTeam.logo}
                alt={match.awayTeam.name}
                className="h-10 w-10 rounded-full bg-white/10 object-contain"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bg-hover)] text-sm font-bold text-[var(--text-muted)]">
                {match.awayTeam.shortName.slice(0, 2)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="card p-6">
        <MatchForm match={match} teams={teams} currentSeason={currentSeason} isEdit />
      </div>
    </div>
  );
}
