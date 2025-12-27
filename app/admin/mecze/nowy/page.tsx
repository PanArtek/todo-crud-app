import Link from "next/link";
import { getTeams } from "@/app/actions/teams";
import { getLeagueInfo } from "@/app/actions/league";
import { MatchForm } from "@/components/admin/match-form";

interface Team {
  _id: string;
  name: string;
  shortName: string;
  logo?: string;
}

interface LeagueInfo {
  currentSeason: string;
}

export default async function NewMatchPage() {
  const [teamsResult, leagueResult] = await Promise.all([
    getTeams(),
    getLeagueInfo(),
  ]);

  if (!teamsResult.success || !teamsResult.data) {
    return (
      <div className="card p-8 text-center">
        <p className="text-[var(--text-secondary)]">
          {teamsResult.error || "Nie udalo sie pobrac druzyn"}
        </p>
      </div>
    );
  }

  const teams = teamsResult.data as Team[];
  const league = leagueResult.data as LeagueInfo | null;
  const currentSeason = league?.currentSeason || "2024/2025";

  if (teams.length < 2) {
    return (
      <div className="space-y-6 pb-20 lg:pb-0">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/mecze"
            className="rounded-lg p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>
            Nowy mecz
          </h1>
        </div>
        <div className="card p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-[var(--text-muted)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-white">Za malo druzyn</h3>
          <p className="mt-2 text-[var(--text-secondary)]">
            Aby dodac mecz, potrzebujesz minimum 2 druzyn w lidze.
          </p>
          <Link
            href="/admin/druzyny/nowa"
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--accent-primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-primary)]/80"
          >
            Dodaj druzyne
          </Link>
        </div>
      </div>
    );
  }

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
            Nowy mecz
          </h1>
          <p className="mt-1 text-[var(--text-secondary)]">
            Dodaj nowy mecz do terminarza
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="card p-6">
        <MatchForm teams={teams} currentSeason={currentSeason} />
      </div>
    </div>
  );
}
