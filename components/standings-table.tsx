import Link from "next/link";
import type { Standing, FormResult } from "@/types";

interface StandingsTableProps {
  standings: Standing[];
}

export function StandingsTable({ standings }: StandingsTableProps) {
  if (standings.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-[var(--text-secondary)]">
          Brak danych do wyswietlenia. Sezon jeszcze sie nie rozpoczal.
        </p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
              <th className="sticky left-0 bg-[var(--bg-secondary)] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Druzyna
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                M
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                W
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                R
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                P
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                GZ
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                GS
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                RB
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Pkt
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Forma
              </th>
            </tr>
          </thead>
          <tbody>
            {standings.map((standing) => (
              <tr
                key={standing.team._id.toString()}
                className="table-row-hover border-b border-[var(--border-color)] last:border-b-0"
              >
                <td className="sticky left-0 bg-[var(--bg-card)] px-4 py-3">
                  <PositionBadge position={standing.position} />
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/druzyna/${standing.team.slug}`}
                    className="flex items-center gap-3 hover:text-[var(--accent-secondary)] transition-colors"
                  >
                    <TeamLogo
                      logo={standing.team.logo}
                      name={standing.team.name}
                    />
                    <span className="font-medium">{standing.team.name}</span>
                  </Link>
                </td>
                <td className="px-3 py-3 text-center text-[var(--text-secondary)]">
                  {standing.played}
                </td>
                <td className="px-3 py-3 text-center text-[var(--text-secondary)]">
                  {standing.won}
                </td>
                <td className="px-3 py-3 text-center text-[var(--text-secondary)]">
                  {standing.drawn}
                </td>
                <td className="px-3 py-3 text-center text-[var(--text-secondary)]">
                  {standing.lost}
                </td>
                <td className="px-3 py-3 text-center text-[var(--text-secondary)]">
                  {standing.goalsFor}
                </td>
                <td className="px-3 py-3 text-center text-[var(--text-secondary)]">
                  {standing.goalsAgainst}
                </td>
                <td className="px-3 py-3 text-center">
                  <span
                    className={
                      standing.goalDifference > 0
                        ? "text-[var(--status-win)]"
                        : standing.goalDifference < 0
                          ? "text-[var(--status-loss)]"
                          : "text-[var(--text-secondary)]"
                    }
                  >
                    {standing.goalDifference > 0 ? "+" : ""}
                    {standing.goalDifference}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className="font-bold text-lg"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    {standing.points}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <FormIndicator form={standing.form} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile List */}
      <div className="md:hidden divide-y divide-[var(--border-color)]">
        {standings.map((standing) => (
          <Link
            key={standing.team._id.toString()}
            href={`/druzyna/${standing.team.slug}`}
            className="flex items-center gap-3 p-4 table-row-hover"
          >
            <PositionBadge position={standing.position} />
            <TeamLogo logo={standing.team.logo} name={standing.team.name} />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{standing.team.name}</p>
              <p className="text-sm text-[var(--text-muted)]">
                {standing.played}M {standing.won}W {standing.drawn}R{" "}
                {standing.lost}P
              </p>
            </div>
            <div className="text-right">
              <p
                className="font-bold text-lg"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                {standing.points}
              </p>
              <p
                className={`text-sm ${
                  standing.goalDifference > 0
                    ? "text-[var(--status-win)]"
                    : standing.goalDifference < 0
                      ? "text-[var(--status-loss)]"
                      : "text-[var(--text-muted)]"
                }`}
              >
                {standing.goalDifference > 0 ? "+" : ""}
                {standing.goalDifference}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function PositionBadge({ position }: { position: number }) {
  const isPromotion = position <= 3;
  const isRelegation = position >= 16;

  return (
    <div
      className={`flex h-7 w-7 items-center justify-center rounded-md text-sm font-bold ${
        isPromotion
          ? "bg-[var(--position-promotion)]/20 text-[var(--position-promotion)]"
          : isRelegation
            ? "bg-[var(--position-relegation)]/20 text-[var(--position-relegation)]"
            : "bg-[var(--bg-hover)] text-[var(--text-secondary)]"
      }`}
    >
      {position}
    </div>
  );
}

function TeamLogo({ logo, name }: { logo?: string; name: string }) {
  if (logo) {
    return (
      <img
        src={logo}
        alt={`${name} logo`}
        className="h-8 w-8 rounded-full object-contain bg-white/10"
      />
    );
  }

  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-hover)] text-xs font-bold text-[var(--text-muted)]">
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

function FormIndicator({ form }: { form: FormResult[] }) {
  if (form.length === 0) {
    return (
      <span className="text-xs text-[var(--text-muted)]">-</span>
    );
  }

  return (
    <div className="flex items-center justify-center gap-1">
      {form.map((result, index) => (
        <div
          key={index}
          className={`form-dot ${
            result === "W"
              ? "form-dot-win"
              : result === "D"
                ? "form-dot-draw"
                : "form-dot-loss"
          }`}
          title={
            result === "W"
              ? "Wygrana"
              : result === "D"
                ? "Remis"
                : "Przegrana"
          }
        />
      ))}
    </div>
  );
}

export function StandingsTableSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="hidden md:block">
        <div className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-3">
          <div className="h-4 w-full animate-pulse rounded bg-[var(--bg-hover)]" />
        </div>
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-[var(--border-color)] px-4 py-3"
          >
            <div className="h-7 w-7 animate-pulse rounded-md bg-[var(--bg-hover)]" />
            <div className="h-8 w-8 animate-pulse rounded-full bg-[var(--bg-hover)]" />
            <div className="h-4 flex-1 animate-pulse rounded bg-[var(--bg-hover)]" />
            <div className="h-4 w-8 animate-pulse rounded bg-[var(--bg-hover)]" />
          </div>
        ))}
      </div>
      <div className="md:hidden divide-y divide-[var(--border-color)]">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-4">
            <div className="h-7 w-7 animate-pulse rounded-md bg-[var(--bg-hover)]" />
            <div className="h-8 w-8 animate-pulse rounded-full bg-[var(--bg-hover)]" />
            <div className="flex-1">
              <div className="h-4 w-32 animate-pulse rounded bg-[var(--bg-hover)]" />
              <div className="mt-1 h-3 w-24 animate-pulse rounded bg-[var(--bg-hover)]" />
            </div>
            <div className="h-6 w-8 animate-pulse rounded bg-[var(--bg-hover)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
