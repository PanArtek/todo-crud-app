import Link from "next/link";
import { getTeams } from "@/app/actions/teams";
import { DeleteTeamButton } from "@/components/admin/delete-team-button";

interface Team {
  _id: string;
  name: string;
  shortName: string;
  slug: string;
  city?: string;
  stadium?: string;
  logo?: string;
}

export default async function TeamsPage() {
  const result = await getTeams();

  if (!result.success) {
    return (
      <div className="card p-8 text-center">
        <p className="text-[var(--text-secondary)]">
          {result.error || "Nie udalo sie pobrac druzyn"}
        </p>
      </div>
    );
  }

  const teams = result.data as Team[];

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>
            Druzyny
          </h1>
          <p className="mt-1 text-[var(--text-secondary)]">
            {teams.length} {teams.length === 1 ? "druzyna" : "druzyn"} w lidze
          </p>
        </div>
        <Link
          href="/admin/druzyny/nowa"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--accent-primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-primary)]/80"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Dodaj druzyne
        </Link>
      </div>

      {/* Teams List */}
      {teams.length === 0 ? (
        <div className="card p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-[var(--text-muted)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-white">Brak druzyn</h3>
          <p className="mt-2 text-[var(--text-secondary)]">
            Dodaj pierwsza druzyne do ligi.
          </p>
          <Link
            href="/admin/druzyny/nowa"
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--accent-primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-primary)]/80"
          >
            Dodaj druzyne
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Druzyna
                  </th>
                  <th className="hidden px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] sm:table-cell">
                    Skrot
                  </th>
                  <th className="hidden px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] md:table-cell">
                    Miasto
                  </th>
                  <th className="hidden px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] lg:table-cell">
                    Stadion
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {teams.map((team) => (
                  <tr key={team._id} className="table-row-hover">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        {team.logo ? (
                          <img
                            src={team.logo}
                            alt={team.name}
                            className="h-10 w-10 rounded-full bg-white/10 object-contain"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bg-hover)] text-sm font-bold text-[var(--text-muted)]">
                            {team.shortName.slice(0, 2)}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-white">{team.name}</div>
                          <div className="text-sm text-[var(--text-muted)] sm:hidden">
                            {team.shortName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden whitespace-nowrap px-6 py-4 text-[var(--text-secondary)] sm:table-cell">
                      <span className="rounded bg-[var(--bg-hover)] px-2 py-1 text-xs font-medium">
                        {team.shortName}
                      </span>
                    </td>
                    <td className="hidden whitespace-nowrap px-6 py-4 text-[var(--text-secondary)] md:table-cell">
                      {team.city || "-"}
                    </td>
                    <td className="hidden whitespace-nowrap px-6 py-4 text-[var(--text-secondary)] lg:table-cell">
                      <span className="max-w-[200px] truncate block">
                        {team.stadium || "-"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/druzyny/${team._id}`}
                          className="rounded-lg p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-white"
                          title="Edytuj"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <DeleteTeamButton teamId={team._id} teamName={team.name} />
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
