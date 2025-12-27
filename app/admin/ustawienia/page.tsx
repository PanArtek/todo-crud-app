"use client";

import { useEffect, useState } from "react";
import { getLeagueSettings, updateCurrentRound } from "@/app/actions/league";

interface League {
  _id: string;
  name: string;
  country: string;
  currentSeason: string;
  currentRound: number;
  totalRounds: number;
  teamsCount: number;
}

interface Stats {
  totalMatches: number;
  finishedMatches: number;
  remainingMatches: number;
}

export default function SettingsPage() {
  const [league, setLeague] = useState<League | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRound, setSelectedRound] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      const result = await getLeagueSettings();

      if (!result.success || !result.data) {
        setError(result.error || "Nie udalo sie pobrac ustawien");
        setLoading(false);
        return;
      }

      const data = result.data as { league: League; stats: Stats };
      setLeague(data.league);
      setStats(data.stats);
      setSelectedRound(data.league.currentRound);
      setLoading(false);
    }

    loadData();
  }, []);

  const handleSaveRound = async () => {
    if (!league || selectedRound === league.currentRound) return;

    setIsSaving(true);
    setSaveMessage(null);

    const result = await updateCurrentRound(selectedRound);

    if (result.success) {
      setLeague((prev) => (prev ? { ...prev, currentRound: selectedRound } : null));
      setSaveMessage({ type: "success", text: "Aktualna kolejka zostala zmieniona!" });
    } else {
      setSaveMessage({ type: "error", text: result.error || "Nie udalo sie zapisac zmian" });
    }

    setIsSaving(false);
    setTimeout(() => setSaveMessage(null), 5000);
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-20 lg:pb-0">
        <div className="h-8 w-48 animate-pulse rounded bg-[var(--bg-hover)]" />
        <div className="card h-64 animate-pulse bg-[var(--bg-hover)]" />
      </div>
    );
  }

  if (error || !league) {
    return (
      <div className="card p-8 text-center">
        <p className="text-[var(--text-secondary)]">{error || "Nie udalo sie pobrac danych"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>
          Ustawienia
        </h1>
        <p className="mt-1 text-[var(--text-secondary)]">
          Zarzadzaj ustawieniami ligi
        </p>
      </div>

      {/* Notifications */}
      {saveMessage && (
        <div
          className={`rounded-lg p-4 text-sm ${
            saveMessage.type === "success"
              ? "bg-[var(--status-win)]/20 text-[var(--status-win)]"
              : "bg-[var(--status-loss)]/20 text-[var(--status-loss)]"
          }`}
        >
          {saveMessage.text}
        </div>
      )}

      {/* League Info */}
      <div className="card p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Informacje o lidze</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoCard label="Nazwa" value={league.name} />
          <InfoCard label="Kraj" value={league.country} />
          <InfoCard label="Sezon" value={league.currentSeason} />
          <InfoCard label="Liczba druzyn" value={String(league.teamsCount)} />
        </div>
      </div>

      {/* Current Round */}
      <div className="card p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Aktualna kolejka</h2>
        <p className="mb-4 text-sm text-[var(--text-secondary)]">
          Aktualna kolejka jest domyslnie wyswietlana na stronie terminarza. Zmiana kolejki
          spowoduje, ze strona publiczna bedzie pokazywac mecze nowej kolejki.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="currentRound" className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
              Wybierz kolejke
            </label>
            <select
              id="currentRound"
              value={selectedRound}
              onChange={(e) => setSelectedRound(Number(e.target.value))}
              className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2.5 text-white focus:border-[var(--accent-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-secondary)] sm:max-w-xs"
            >
              {Array.from({ length: league.totalRounds }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  Kolejka {i + 1} {i + 1 === league.currentRound ? "(aktualna)" : ""}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleSaveRound}
            disabled={isSaving || selectedRound === league.currentRound}
            className="rounded-lg bg-[var(--accent-primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-primary)]/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "Zapisywanie..." : "Zapisz"}
          </button>
        </div>

        {selectedRound !== league.currentRound && (
          <p className="mt-3 text-sm text-[var(--accent-secondary)]">
            Zmiana z kolejki {league.currentRound} na kolejke {selectedRound}
          </p>
        )}
      </div>

      {/* Season Statistics */}
      {stats && (
        <div className="card p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Statystyki sezonu</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Mecze rozegrane"
              value={stats.finishedMatches}
              total={stats.totalMatches}
              color="status-win"
            />
            <StatCard
              label="Mecze do rozegrania"
              value={stats.remainingMatches}
              total={stats.totalMatches}
              color="accent-secondary"
            />
            <StatCard
              label="Postep sezonu"
              value={Math.round((stats.finishedMatches / stats.totalMatches) * 100) || 0}
              suffix="%"
              color="accent-primary"
            />
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Postep</span>
              <span className="font-medium text-white">
                {stats.finishedMatches} / {stats.totalMatches} meczow
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-[var(--bg-hover)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] transition-all duration-500"
                style={{ width: `${(stats.finishedMatches / stats.totalMatches) * 100 || 0}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Rounds Overview */}
      <div className="card p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Przeglad kolejek</h2>
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-12 lg:grid-cols-17">
          {Array.from({ length: league.totalRounds }, (_, i) => {
            const round = i + 1;
            const isCurrent = round === league.currentRound;
            const isSelected = round === selectedRound;

            return (
              <button
                key={round}
                onClick={() => setSelectedRound(round)}
                className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  isCurrent
                    ? "bg-[var(--accent-primary)] text-white"
                    : isSelected
                      ? "bg-[var(--accent-secondary)] text-white"
                      : "bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]/80"
                }`}
                title={`Kolejka ${round}${isCurrent ? " (aktualna)" : ""}`}
              >
                {round}
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-[var(--accent-primary)]" />
            <span>Aktualna</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-[var(--accent-secondary)]" />
            <span>Wybrana</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[var(--bg-hover)] p-4">
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function StatCard({
  label,
  value,
  total,
  suffix,
  color,
}: {
  label: string;
  value: number;
  total?: number;
  suffix?: string;
  color: string;
}) {
  return (
    <div className="rounded-lg bg-[var(--bg-hover)] p-4">
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      <p className={`mt-1 text-2xl font-bold text-[var(--${color})]`} style={{ fontFamily: "var(--font-outfit)" }}>
        {value}{suffix}
        {total && <span className="text-base font-normal text-[var(--text-muted)]"> / {total}</span>}
      </p>
    </div>
  );
}
