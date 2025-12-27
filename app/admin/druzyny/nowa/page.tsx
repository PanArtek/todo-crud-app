import Link from "next/link";
import { TeamForm } from "@/components/admin/team-form";

export default function NewTeamPage() {
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
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>
            Nowa druzyna
          </h1>
          <p className="mt-1 text-[var(--text-secondary)]">
            Dodaj nowa druzyne do ligi
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="card p-6">
        <TeamForm />
      </div>
    </div>
  );
}
