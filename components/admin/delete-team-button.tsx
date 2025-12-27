"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteTeam } from "@/app/actions/teams";

interface DeleteTeamButtonProps {
  teamId: string;
  teamName: string;
}

export function DeleteTeamButton({ teamId, teamName }: DeleteTeamButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    const result = await deleteTeam(teamId);

    if (result.success) {
      setShowConfirm(false);
      router.refresh();
    } else {
      setError(result.error || "Nie udalo sie usunac druzyny");
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="rounded-lg p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--status-loss)]/20 hover:text-[var(--status-loss)]"
        title="Usun"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-[var(--bg-card)] p-6 shadow-xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--status-loss)]/20">
              <svg className="h-6 w-6 text-[var(--status-loss)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">Usunac druzyne?</h3>
            <p className="mt-2 text-[var(--text-secondary)]">
              Czy na pewno chcesz usunac druzyne <strong className="text-white">{teamName}</strong>?
              Ta operacja jest nieodwracalna.
            </p>
            {error && (
              <div className="mt-4 rounded-lg bg-[var(--status-loss)]/20 p-3 text-sm text-[var(--status-loss)]">
                {error}
              </div>
            )}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setError(null);
                }}
                disabled={isDeleting}
                className="flex-1 rounded-lg bg-[var(--bg-hover)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--bg-hover)]/80 disabled:opacity-50"
              >
                Anuluj
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 rounded-lg bg-[var(--status-loss)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--status-loss)]/80 disabled:opacity-50"
              >
                {isDeleting ? "Usuwanie..." : "Usun"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
