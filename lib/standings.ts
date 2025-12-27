/**
 * Standings Calculation Module
 *
 * 🔴 KRYTYCZNE: Tabela ligowa jest PROJEKCJĄ, nie kolekcją!
 * Wyliczana w locie z kolekcji Match przez agregację.
 *
 * Sortowanie wg zasad Ekstraklasy (PZPN):
 * 1. Punkty w meczach bezpośrednich (head-to-head)
 * 2. Różnica bramek w meczach bezpośrednich
 * 3. Bramki strzelone w meczach bezpośrednich
 * 4. Różnica bramek ogółem
 * 5. Bramki strzelone ogółem
 */

import Match from "@/models/Match";
import Team from "@/models/Team";
import { Standing, FormResult, TeamInfo } from "@/types";
import { Types } from "mongoose";

/**
 * Internal interface for team statistics during calculation
 */
interface TeamStats {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  recentMatches: { result: FormResult; date: Date }[];
}

/**
 * Internal interface for head-to-head statistics
 */
interface H2HStats {
  points: number;
  goalDiff: number;
  goalsFor: number;
}

/**
 * Lean match type from MongoDB query
 */
interface LeanMatch {
  _id: Types.ObjectId;
  homeTeam: Types.ObjectId;
  awayTeam: Types.ObjectId;
  homeScore: number;
  awayScore: number;
  date: Date;
}

/**
 * Calculate complete league standings for a given season
 *
 * @param season - Season string in format "YYYY/YYYY" (e.g., "2024/2025")
 * @returns Promise<Standing[]> - Sorted standings array with team data and statistics
 *
 * @example
 * const standings = await calculateStandings("2024/2025");
 * console.log(standings[0]); // League leader
 */
export async function calculateStandings(season: string): Promise<Standing[]> {
  // Krok 1: Pobierz wszystkie zakończone mecze sezonu
  const matches = await Match.find({
    season,
    status: "FINISHED",
  })
    .select("homeTeam awayTeam homeScore awayScore date")
    .lean<LeanMatch[]>();

  // Brak meczów = pusta tabela
  if (matches.length === 0) {
    return [];
  }

  // Krok 2: Oblicz podstawowe statystyki dla każdej drużyny
  const statsMap = new Map<string, TeamStats>();

  for (const match of matches) {
    const homeId = match.homeTeam.toString();
    const awayId = match.awayTeam.toString();

    // Inicjalizacja jeśli drużyna nie istnieje w mapie
    if (!statsMap.has(homeId)) {
      statsMap.set(homeId, createEmptyStats(homeId));
    }
    if (!statsMap.has(awayId)) {
      statsMap.set(awayId, createEmptyStats(awayId));
    }

    const homeStats = statsMap.get(homeId)!;
    const awayStats = statsMap.get(awayId)!;

    // Aktualizacja liczby meczów
    homeStats.played++;
    awayStats.played++;

    // Aktualizacja bramek
    homeStats.goalsFor += match.homeScore;
    homeStats.goalsAgainst += match.awayScore;
    awayStats.goalsFor += match.awayScore;
    awayStats.goalsAgainst += match.homeScore;

    // Określenie wyniku i aktualizacja punktów
    if (match.homeScore > match.awayScore) {
      // Wygrana gospodarzy
      homeStats.won++;
      homeStats.points += 3;
      awayStats.lost++;
      homeStats.recentMatches.push({ result: "W", date: match.date });
      awayStats.recentMatches.push({ result: "L", date: match.date });
    } else if (match.homeScore < match.awayScore) {
      // Wygrana gości
      awayStats.won++;
      awayStats.points += 3;
      homeStats.lost++;
      homeStats.recentMatches.push({ result: "L", date: match.date });
      awayStats.recentMatches.push({ result: "W", date: match.date });
    } else {
      // Remis
      homeStats.drawn++;
      awayStats.drawn++;
      homeStats.points += 1;
      awayStats.points += 1;
      homeStats.recentMatches.push({ result: "D", date: match.date });
      awayStats.recentMatches.push({ result: "D", date: match.date });
    }
  }

  // Krok 3: Sortowanie z uwzględnieniem head-to-head
  const sortedStats = sortWithHeadToHead(Array.from(statsMap.values()), matches);

  // Krok 4: Pobierz dane drużyn i zbuduj finalne standings
  const teamIds = sortedStats.map((s) => new Types.ObjectId(s.teamId));
  const teams = await Team.find({ _id: { $in: teamIds } })
    .select("name shortName slug logo")
    .lean();

  const teamMap = new Map(teams.map((t) => [t._id.toString(), t]));

  return sortedStats.map((stats, index) => {
    const team = teamMap.get(stats.teamId);

    // Oblicz formę (ostatnie 5 meczów, najnowsze pierwsze)
    const form = stats.recentMatches
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5)
      .map((m) => m.result);

    const teamInfo: TeamInfo = {
      _id: new Types.ObjectId(stats.teamId),
      name: team?.name || "Unknown",
      shortName: team?.shortName || "UNK",
      slug: team?.slug || "unknown",
      logo: team?.logo,
    };

    return {
      team: teamInfo,
      position: index + 1,
      played: stats.played,
      won: stats.won,
      drawn: stats.drawn,
      lost: stats.lost,
      goalsFor: stats.goalsFor,
      goalsAgainst: stats.goalsAgainst,
      goalDifference: stats.goalsFor - stats.goalsAgainst,
      points: stats.points,
      form,
    };
  });
}

/**
 * Create empty statistics object for a team
 */
function createEmptyStats(teamId: string): TeamStats {
  return {
    teamId,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0,
    recentMatches: [],
  };
}

/**
 * Sort teams with head-to-head tiebreaker rules
 *
 * Groups teams by points and applies Ekstraklasa sorting rules
 * for teams with equal points.
 *
 * @param stats - Array of team statistics
 * @param matches - All finished matches for head-to-head calculation
 * @returns Sorted array of team statistics
 */
function sortWithHeadToHead(stats: TeamStats[], matches: LeanMatch[]): TeamStats[] {
  // Sortowanie wstępne po punktach (malejąco)
  stats.sort((a, b) => b.points - a.points);

  const result: TeamStats[] = [];
  let i = 0;

  while (i < stats.length) {
    const currentTeam = stats[i];
    if (!currentTeam) break;

    const currentPoints = currentTeam.points;
    const samePointsTeams: TeamStats[] = [];

    // Zbierz wszystkie drużyny z tą samą liczbą punktów
    while (i < stats.length) {
      const team = stats[i];
      if (!team || team.points !== currentPoints) break;
      samePointsTeams.push(team);
      i++;
    }

    if (samePointsTeams.length === 1 && samePointsTeams[0]) {
      // Tylko jedna drużyna z tą liczbą punktów - nie trzeba sortować h2h
      result.push(samePointsTeams[0]);
    } else if (samePointsTeams.length > 1) {
      // Wiele drużyn z tą samą liczbą punktów - sortuj head-to-head
      const sorted = sortGroupByHeadToHead(samePointsTeams, matches);
      result.push(...sorted);
    }
  }

  return result;
}

/**
 * Sort a group of teams with equal points using head-to-head rules
 *
 * Ekstraklasa tiebreaker order:
 * 1. Points in head-to-head matches
 * 2. Goal difference in head-to-head matches
 * 3. Goals scored in head-to-head matches
 * 4. Overall goal difference
 * 5. Overall goals scored
 *
 * @param teams - Teams with equal points
 * @param allMatches - All finished matches
 * @returns Sorted teams array
 */
function sortGroupByHeadToHead(teams: TeamStats[], allMatches: LeanMatch[]): TeamStats[] {
  const teamIds = new Set(teams.map((t) => t.teamId));

  // Filtruj mecze bezpośrednie między drużynami w grupie
  // Ważne: bierzemy TYLKO mecze między drużynami w tej grupie
  const h2hMatches = allMatches.filter(
    (m) => teamIds.has(m.homeTeam.toString()) && teamIds.has(m.awayTeam.toString())
  );

  // Inicjalizuj statystyki head-to-head dla każdej drużyny
  const h2hStats = new Map<string, H2HStats>();
  for (const team of teams) {
    h2hStats.set(team.teamId, { points: 0, goalDiff: 0, goalsFor: 0 });
  }

  // Oblicz mini-tabelę head-to-head
  for (const match of h2hMatches) {
    const homeId = match.homeTeam.toString();
    const awayId = match.awayTeam.toString();
    const homeH2H = h2hStats.get(homeId)!;
    const awayH2H = h2hStats.get(awayId)!;

    // Bramki
    homeH2H.goalsFor += match.homeScore;
    awayH2H.goalsFor += match.awayScore;
    homeH2H.goalDiff += match.homeScore - match.awayScore;
    awayH2H.goalDiff += match.awayScore - match.homeScore;

    // Punkty
    if (match.homeScore > match.awayScore) {
      homeH2H.points += 3;
    } else if (match.homeScore < match.awayScore) {
      awayH2H.points += 3;
    } else {
      homeH2H.points += 1;
      awayH2H.points += 1;
    }
  }

  // Sortuj według zasad Ekstraklasy
  return [...teams].sort((a, b) => {
    const aH2H = h2hStats.get(a.teamId)!;
    const bH2H = h2hStats.get(b.teamId)!;

    // 1. Punkty head-to-head
    if (bH2H.points !== aH2H.points) {
      return bH2H.points - aH2H.points;
    }

    // 2. Różnica bramek head-to-head
    if (bH2H.goalDiff !== aH2H.goalDiff) {
      return bH2H.goalDiff - aH2H.goalDiff;
    }

    // 3. Bramki strzelone head-to-head
    if (bH2H.goalsFor !== aH2H.goalsFor) {
      return bH2H.goalsFor - aH2H.goalsFor;
    }

    // 4. Różnica bramek ogółem
    const aGD = a.goalsFor - a.goalsAgainst;
    const bGD = b.goalsFor - b.goalsAgainst;
    if (bGD !== aGD) {
      return bGD - aGD;
    }

    // 5. Bramki strzelone ogółem
    return b.goalsFor - a.goalsFor;
  });
}

/**
 * Get standings for a specific team
 *
 * @param season - Season string
 * @param teamId - Team ObjectId as string
 * @returns Team's standing or null if not found
 */
export async function getTeamStanding(
  season: string,
  teamId: string
): Promise<Standing | null> {
  const standings = await calculateStandings(season);
  return standings.find((s) => s.team._id.toString() === teamId) || null;
}
