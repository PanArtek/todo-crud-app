import { Suspense } from "react";
import { Metadata } from "next";
import {
  StandingsTable,
  StandingsTableSkeleton,
} from "@/components/standings-table";
import { connectToDatabase } from "@/lib/mongodb";
import { calculateStandings } from "@/lib/standings";
import League from "@/models/League";

export const metadata: Metadata = {
  title: "Tabela Ekstraklasy 2024/2025",
  description:
    "Aktualna tabela polskiej Ekstraklasy. Sprawdz pozycje druzyn, punkty, bilans bramkowy i forme.",
};

export const dynamic = "force-dynamic";

async function StandingsData() {
  await connectToDatabase();

  const league = await League.findOne({ country: "PL" })
    .select("currentSeason currentRound")
    .lean();

  if (!league) {
    return (
      <div className="card p-8 text-center">
        <p className="text-[var(--text-secondary)]">
          Nie znaleziono danych ligi.
        </p>
      </div>
    );
  }

  const standings = await calculateStandings(league.currentSeason);

  return (
    <>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-bold sm:text-3xl"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Tabela Ekstraklasy
          </h1>
          <p className="mt-1 text-[var(--text-secondary)]">
            Sezon {league.currentSeason} &bull; Kolejka {league.currentRound}
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-[var(--position-promotion)]" />
            <span className="text-[var(--text-secondary)]">
              Strefa pucharow
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-[var(--position-relegation)]" />
            <span className="text-[var(--text-secondary)]">Strefa spadku</span>
          </div>
        </div>
      </div>
      <StandingsTable standings={standings} />
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <StandingsData />
    </Suspense>
  );
}

function LoadingState() {
  return (
    <>
      <div className="mb-6">
        <div className="h-8 w-64 animate-pulse rounded bg-[var(--bg-card)]" />
        <div className="mt-2 h-4 w-40 animate-pulse rounded bg-[var(--bg-card)]" />
      </div>
      <StandingsTableSkeleton />
    </>
  );
}
