import Link from "next/link";
import { getDashboardStats } from "@/app/actions/league";

interface DashboardData {
  currentSeason: string;
  currentRound: number;
  totalRounds: number;
  teamsCount: number;
  totalMatches: number;
  finishedMatches: number;
  scheduledMatches: number;
  liveMatches: number;
  remainingMatches: number;
  matchesByRound: Array<{ _id: number; total: number; finished: number }>;
}

export default async function AdminDashboardPage() {
  const result = await getDashboardStats();

  if (!result.success || !result.data) {
    return (
      <div className="card p-8 text-center">
        <p className="text-[var(--text-secondary)]">
          {result.error || "Nie udalo sie pobrac danych"}
        </p>
      </div>
    );
  }

  const stats = result.data as DashboardData;

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>
          Dashboard
        </h1>
        <p className="mt-1 text-[var(--text-secondary)]">
          Sezon {stats.currentSeason} - Kolejka {stats.currentRound}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Druzyny"
          value={stats.teamsCount}
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          color="accent-primary"
        />
        <StatCard
          title="Mecze rozegrane"
          value={stats.finishedMatches}
          subtitle={`z ${stats.totalMatches}`}
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="status-win"
        />
        <StatCard
          title="Do rozegrania"
          value={stats.remainingMatches}
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="accent-secondary"
        />
        <StatCard
          title="Aktualna kolejka"
          value={stats.currentRound}
          subtitle={`z ${stats.totalRounds}`}
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          color="text-secondary"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">Szybkie akcje</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickActionCard
            href="/admin/wyniki"
            title="Wprowadz wyniki"
            description="Dodaj wyniki meczow biezacej kolejki"
            icon={
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <QuickActionCard
            href="/admin/mecze/nowy"
            title="Dodaj mecz"
            description="Utworz nowy mecz w terminarzu"
            icon={
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            }
          />
          <QuickActionCard
            href="/admin/druzyny/nowa"
            title="Dodaj druzyne"
            description="Dodaj nowa druzyne do ligi"
            icon={
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            }
          />
          <QuickActionCard
            href="/admin/ustawienia"
            title="Ustawienia"
            description="Zmien aktualna kolejke"
            icon={
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />
        </div>
      </div>

      {/* Season Progress */}
      <div className="card p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Postep sezonu</h2>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-[var(--text-secondary)]">Rozegrane mecze</span>
          <span className="font-medium text-white">
            {stats.finishedMatches} / {stats.totalMatches} ({Math.round((stats.finishedMatches / stats.totalMatches) * 100) || 0}%)
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-[var(--bg-hover)]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] transition-all duration-500"
            style={{ width: `${(stats.finishedMatches / stats.totalMatches) * 100 || 0}%` }}
          />
        </div>
      </div>

      {/* Rounds Overview */}
      {stats.matchesByRound.length > 0 && (
        <div className="card p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Kolejki</h2>
          <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-12 lg:grid-cols-17">
            {Array.from({ length: stats.totalRounds }, (_, i) => {
              const round = i + 1;
              const roundData = stats.matchesByRound.find((r) => r._id === round);
              const isComplete = roundData && roundData.finished === roundData.total && roundData.total > 0;
              const hasMatches = roundData && roundData.total > 0;
              const isCurrent = round === stats.currentRound;

              return (
                <div
                  key={round}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    isCurrent
                      ? "bg-[var(--accent-primary)] text-white ring-2 ring-[var(--accent-primary)] ring-offset-2 ring-offset-[var(--bg-card)]"
                      : isComplete
                        ? "bg-[var(--status-win)]/20 text-[var(--status-win)]"
                        : hasMatches
                          ? "bg-[var(--bg-hover)] text-[var(--text-secondary)]"
                          : "bg-[var(--bg-primary)] text-[var(--text-muted)]"
                  }`}
                  title={`Kolejka ${round}${roundData ? `: ${roundData.finished}/${roundData.total} meczow` : ""}`}
                >
                  {round}
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-[var(--accent-primary)]" />
              <span>Aktualna</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-[var(--status-win)]/20" />
              <span>Zakonczona</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-[var(--bg-hover)]" />
              <span>W trakcie</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: {
  title: string;
  value: number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[var(--text-secondary)]">{title}</p>
          <p className="mt-1 text-3xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p>
          )}
        </div>
        <div className={`rounded-lg bg-[var(--${color})]/20 p-3 text-[var(--${color})]`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="card flex flex-col items-center p-6 text-center transition-colors hover:bg-[var(--bg-hover)]"
    >
      <div className="mb-3 text-[var(--accent-secondary)]">{icon}</div>
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">{description}</p>
    </Link>
  );
}
