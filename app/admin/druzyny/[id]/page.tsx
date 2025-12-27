import Link from "next/link";
import { notFound } from "next/navigation";
import { getTeamById } from "@/app/actions/teams";
import { TeamForm } from "@/components/admin/team-form";

interface EditTeamPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTeamPage({ params }: EditTeamPageProps) {
  const { id } = await params;
  const result = await getTeamById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const team = result.data as {
    _id: string;
    name: string;
    shortName: string;
    slug: string;
    stadium?: string;
    city?: string;
    founded?: number;
    logo?: string;
    colors?: {
      primary?: string;
      secondary?: string;
    };
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/druzyny"
          className="rounded-lg p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-white"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div className="flex items-center gap-3">
          {team.logo ? (
            <img
              src={team.logo}
              alt={team.name}
              className="h-12 w-12 rounded-full bg-white/10 object-contain"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-hover)] text-lg font-bold text-[var(--text-muted)]">
              {team.shortName.slice(0, 2)}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>
              {team.name}
            </h1>
            <p className="mt-1 text-[var(--text-secondary)]">
              Edytuj dane druzyny
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="card p-6">
        <TeamForm team={team} isEdit />
      </div>
    </div>
  );
}
