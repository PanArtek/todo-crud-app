import Link from "next/link";
import type { MatchStatus } from "@/models/Match";

interface TeamInfo {
  _id: string;
  name: string;
  shortName: string;
  slug: string;
  logo?: string;
}

interface MatchCardProps {
  match: {
    _id: string;
    homeTeam: TeamInfo;
    awayTeam: TeamInfo;
    homeScore: number | null;
    awayScore: number | null;
    date: string;
    time?: string;
    stadium?: string;
    status: MatchStatus;
  };
}

export function MatchCard({ match }: MatchCardProps) {
  const isFinished = match.status === "FINISHED";
  const isLive = match.status === "LIVE";

  const matchDate = new Date(match.date);
  const formattedDate = matchDate.toLocaleDateString("pl-PL", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <Link
      href={`/mecz/${match._id}`}
      className="card block p-4 transition-all hover:border-[var(--accent-secondary)]/50 hover:bg-[var(--bg-hover)]"
    >
      {/* Status badge */}
      <div className="mb-3 flex items-center justify-between">
        <StatusBadge status={match.status} />
        {match.stadium && (
          <span className="text-xs text-[var(--text-muted)] truncate max-w-[150px]">
            {match.stadium}
          </span>
        )}
      </div>

      {/* Teams and score */}
      <div className="flex items-center gap-4">
        {/* Home team */}
        <div className="flex-1 text-right">
          <div className="flex items-center justify-end gap-2">
            <span className="font-medium truncate">{match.homeTeam.name}</span>
            <TeamLogo logo={match.homeTeam.logo} name={match.homeTeam.name} />
          </div>
        </div>

        {/* Score / Time */}
        <div className="flex-shrink-0 w-24 text-center">
          {isFinished || isLive ? (
            <div
              className={`text-2xl font-bold ${isLive ? "text-[var(--status-live)]" : ""}`}
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              {match.homeScore} - {match.awayScore}
            </div>
          ) : (
            <div>
              <div
                className="text-lg font-semibold text-[var(--accent-secondary)]"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                {match.time || "TBD"}
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                {formattedDate}
              </div>
            </div>
          )}
        </div>

        {/* Away team */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <TeamLogo logo={match.awayTeam.logo} name={match.awayTeam.name} />
            <span className="font-medium truncate">{match.awayTeam.name}</span>
          </div>
        </div>
      </div>

      {/* Date for finished matches */}
      {isFinished && (
        <div className="mt-2 text-center text-xs text-[var(--text-muted)]">
          {formattedDate}
        </div>
      )}
    </Link>
  );
}

function StatusBadge({ status }: { status: MatchStatus }) {
  const config: Record<MatchStatus, { label: string; className: string }> = {
    SCHEDULED: {
      label: "Zaplanowany",
      className: "bg-[var(--bg-hover)] text-[var(--text-secondary)]",
    },
    LIVE: {
      label: "NA ZYWO",
      className:
        "bg-[var(--status-live)]/20 text-[var(--status-live)] animate-pulse-live",
    },
    FINISHED: {
      label: "Zakonczony",
      className: "bg-[var(--status-win)]/20 text-[var(--status-win)]",
    },
    POSTPONED: {
      label: "Przylozony",
      className: "bg-yellow-500/20 text-yellow-500",
    },
    CANCELLED: {
      label: "Odwolany",
      className: "bg-[var(--status-loss)]/20 text-[var(--status-loss)]",
    },
  };

  const { label, className } = config[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {status === "LIVE" && (
        <span className="mr-1 h-2 w-2 rounded-full bg-[var(--status-live)]" />
      )}
      {label}
    </span>
  );
}

function TeamLogo({ logo, name }: { logo?: string; name: string }) {
  if (logo) {
    return (
      <img
        src={logo}
        alt={`${name} logo`}
        className="h-8 w-8 rounded-full object-contain bg-white/10 flex-shrink-0"
      />
    );
  }

  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-hover)] text-xs font-bold text-[var(--text-muted)] flex-shrink-0">
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

export function MatchCardSkeleton() {
  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="h-5 w-20 animate-pulse rounded-full bg-[var(--bg-hover)]" />
        <div className="h-4 w-24 animate-pulse rounded bg-[var(--bg-hover)]" />
      </div>
      <div className="flex items-center gap-4">
        <div className="flex-1 flex items-center justify-end gap-2">
          <div className="h-4 w-24 animate-pulse rounded bg-[var(--bg-hover)]" />
          <div className="h-8 w-8 animate-pulse rounded-full bg-[var(--bg-hover)]" />
        </div>
        <div className="w-24 flex justify-center">
          <div className="h-8 w-16 animate-pulse rounded bg-[var(--bg-hover)]" />
        </div>
        <div className="flex-1 flex items-center gap-2">
          <div className="h-8 w-8 animate-pulse rounded-full bg-[var(--bg-hover)]" />
          <div className="h-4 w-24 animate-pulse rounded bg-[var(--bg-hover)]" />
        </div>
      </div>
    </div>
  );
}

interface MatchListProps {
  matches: MatchCardProps["match"][];
}

export function MatchList({ matches }: MatchListProps) {
  if (matches.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-[var(--text-secondary)]">
          Brak meczow do wyswietlenia.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {matches.map((match) => (
        <MatchCard key={match._id} match={match} />
      ))}
    </div>
  );
}

export function MatchListSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <MatchCardSkeleton key={i} />
      ))}
    </div>
  );
}
