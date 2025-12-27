import { Suspense } from "react";
import { Metadata } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import League from "@/models/League";
import Match from "@/models/Match";
import Team from "@/models/Team";
import { MatchList, MatchListSkeleton } from "@/components/match-card";
import { RoundSelector } from "@/components/round-selector";
import { MatchFilters } from "@/components/match-filters";
import type { MatchStatus } from "@/models/Match";
import type { Types } from "mongoose";

interface PopulatedTeam {
  _id: Types.ObjectId;
  name: string;
  shortName: string;
  slug: string;
  logo?: string;
}

export const metadata: Metadata = {
  title: "Terminarz",
  description:
    "Terminarz meczow polskiej Ekstraklasy. Sprawdz nadchodzace mecze i wyniki.",
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    round?: string;
    teamId?: string;
    status?: string;
  }>;
}

interface MatchQuery {
  season: string;
  round?: number;
  status?: MatchStatus | { $in: MatchStatus[] };
  $or?: Array<{ homeTeam: string } | { awayTeam: string }>;
}

async function TerminarzContent({
  searchParams,
}: {
  searchParams: {
    round?: string;
    teamId?: string;
    status?: string;
  };
}) {
  await connectToDatabase();

  // Get league info
  const league = await League.findOne({ country: "PL" })
    .select("currentSeason currentRound totalRounds")
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

  // Get all teams for filter dropdown
  const teams = await Team.find({ leagueId: league._id })
    .select("name shortName")
    .sort({ name: 1 })
    .lean();

  // Determine which round to show
  const selectedRound = searchParams.round
    ? parseInt(searchParams.round, 10)
    : league.currentRound;

  // Build query
  const query: MatchQuery = {
    season: league.currentSeason,
    round: selectedRound,
  };

  // Team filter
  if (searchParams.teamId) {
    query.$or = [
      { homeTeam: searchParams.teamId },
      { awayTeam: searchParams.teamId },
    ];
  }

  // Status filter
  if (searchParams.status === "played") {
    query.status = "FINISHED";
  } else if (searchParams.status === "upcoming") {
    query.status = { $in: ["SCHEDULED", "POSTPONED"] };
  }

  // Fetch matches
  const matches = await Match.find(query)
    .populate("homeTeam", "name shortName slug logo")
    .populate("awayTeam", "name shortName slug logo")
    .sort({ date: 1, time: 1 })
    .lean();

  // Transform matches for component
  const transformedMatches = matches.map((match) => {
    const homeTeam = match.homeTeam as unknown as PopulatedTeam;
    const awayTeam = match.awayTeam as unknown as PopulatedTeam;
    return {
      _id: match._id.toString(),
      homeTeam: {
        _id: homeTeam._id.toString(),
        name: homeTeam.name,
        shortName: homeTeam.shortName,
        slug: homeTeam.slug,
        logo: homeTeam.logo,
      },
      awayTeam: {
        _id: awayTeam._id.toString(),
        name: awayTeam.name,
        shortName: awayTeam.shortName,
        slug: awayTeam.slug,
        logo: awayTeam.logo,
      },
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      date: match.date.toISOString(),
      time: match.time,
      stadium: match.stadium,
      status: match.status,
    };
  });

  // Transform teams for filter
  const teamsForFilter = teams.map((team) => ({
    _id: team._id.toString(),
    name: team.name,
    shortName: team.shortName,
  }));

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1
          className="text-2xl font-bold sm:text-3xl"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          Terminarz
        </h1>
        <p className="mt-1 text-[var(--text-secondary)]">
          Sezon {league.currentSeason}
        </p>
      </div>

      {/* Round Selector */}
      <div className="mb-6">
        <RoundSelector
          currentRound={league.currentRound}
          selectedRound={selectedRound}
          totalRounds={league.totalRounds}
        />
      </div>

      {/* Filters */}
      <div className="mb-6">
        <MatchFilters
          teams={teamsForFilter}
          selectedTeamId={searchParams.teamId}
          selectedStatus={searchParams.status}
        />
      </div>

      {/* Matches */}
      <MatchList matches={transformedMatches} />

      {/* Stats */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-[var(--text-muted)]">
        <span>
          {transformedMatches.filter((m) => m.status === "FINISHED").length}{" "}
          rozegranych
        </span>
        <span className="text-[var(--border-color)]">|</span>
        <span>
          {
            transformedMatches.filter(
              (m) => m.status === "SCHEDULED" || m.status === "POSTPONED"
            ).length
          }{" "}
          nadchodzacych
        </span>
        {transformedMatches.some((m) => m.status === "LIVE") && (
          <>
            <span className="text-[var(--border-color)]">|</span>
            <span className="text-[var(--status-live)]">
              {transformedMatches.filter((m) => m.status === "LIVE").length} na
              zywo
            </span>
          </>
        )}
      </div>
    </>
  );
}

export default async function TerminarzPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;

  return (
    <Suspense fallback={<LoadingState />}>
      <TerminarzContent searchParams={resolvedParams} />
    </Suspense>
  );
}

function LoadingState() {
  return (
    <>
      <div className="mb-6">
        <div className="h-8 w-48 animate-pulse rounded bg-[var(--bg-card)]" />
        <div className="mt-2 h-4 w-32 animate-pulse rounded bg-[var(--bg-card)]" />
      </div>
      <div className="mb-6 flex justify-center">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-[var(--bg-card)]" />
      </div>
      <div className="mb-6">
        <div className="h-10 w-80 animate-pulse rounded-lg bg-[var(--bg-card)]" />
      </div>
      <MatchListSkeleton />
    </>
  );
}
