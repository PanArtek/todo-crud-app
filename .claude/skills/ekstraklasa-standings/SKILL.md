---
name: ekstraklasa-standings
description: Use when implementing standings calculation, head-to-head sorting, or league table features. Provides MongoDB aggregation patterns and Ekstraklasa tiebreaker rules.
allowed-tools: Read, Write, Edit, Bash
---

# Ekstraklasa Standings Calculation Skill

## 🔴 KRYTYCZNE: Standing to PROJEKCJA, nie kolekcja!

Tabela ligowa jest ZAWSZE wyliczana w locie przez agregację MongoDB z kolekcji Match.
NIE twórz modelu Standing ani kolekcji standings w MongoDB.

## Zasady sortowania Ekstraklasy (przy równej liczbie punktów)

1. **Punkty w meczach bezpośrednich** (head-to-head)
2. **Różnica bramek w meczach bezpośrednich**
3. **Bramki strzelone w meczach bezpośrednich**
4. **Różnica bramek ogółem**
5. **Bramki strzelone ogółem**

## Implementacja calculateStandings()

```typescript
// lib/standings.ts
import { Match } from '@/models/Match';
import { Team } from '@/models/Team';

export interface Standing {
  team: {
    _id: string;
    name: string;
    shortName: string;
    slug: string;
    logo: string;
  };
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: ('W' | 'D' | 'L')[];
}

export async function calculateStandings(season: string): Promise<Standing[]> {
  // Krok 1: Pobierz wszystkie zakończone mecze sezonu
  const matches = await Match.find({
    season,
    status: 'FINISHED',
  }).lean();

  // Krok 2: Oblicz podstawowe statystyki dla każdej drużyny
  const statsMap = new Map<string, {
    teamId: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    points: number;
    recentMatches: { result: 'W' | 'D' | 'L'; date: Date }[];
  }>();

  for (const match of matches) {
    const homeId = match.homeTeam.toString();
    const awayId = match.awayTeam.toString();
    
    // Inicjalizacja jeśli nie istnieje
    if (!statsMap.has(homeId)) {
      statsMap.set(homeId, {
        teamId: homeId,
        played: 0, won: 0, drawn: 0, lost: 0,
        goalsFor: 0, goalsAgainst: 0, points: 0,
        recentMatches: []
      });
    }
    if (!statsMap.has(awayId)) {
      statsMap.set(awayId, {
        teamId: awayId,
        played: 0, won: 0, drawn: 0, lost: 0,
        goalsFor: 0, goalsAgainst: 0, points: 0,
        recentMatches: []
      });
    }

    const homeStats = statsMap.get(homeId)!;
    const awayStats = statsMap.get(awayId)!;

    // Aktualizacja statystyk
    homeStats.played++;
    awayStats.played++;
    homeStats.goalsFor += match.homeScore;
    homeStats.goalsAgainst += match.awayScore;
    awayStats.goalsFor += match.awayScore;
    awayStats.goalsAgainst += match.homeScore;

    if (match.homeScore > match.awayScore) {
      homeStats.won++;
      homeStats.points += 3;
      awayStats.lost++;
      homeStats.recentMatches.push({ result: 'W', date: match.date });
      awayStats.recentMatches.push({ result: 'L', date: match.date });
    } else if (match.homeScore < match.awayScore) {
      awayStats.won++;
      awayStats.points += 3;
      homeStats.lost++;
      homeStats.recentMatches.push({ result: 'L', date: match.date });
      awayStats.recentMatches.push({ result: 'W', date: match.date });
    } else {
      homeStats.drawn++;
      awayStats.drawn++;
      homeStats.points += 1;
      awayStats.points += 1;
      homeStats.recentMatches.push({ result: 'D', date: match.date });
      awayStats.recentMatches.push({ result: 'D', date: match.date });
    }
  }

  // Krok 3: Sortowanie z head-to-head
  const standings = await sortWithHeadToHead(
    Array.from(statsMap.values()),
    matches
  );

  // Krok 4: Pobierz dane drużyn i dodaj pozycje
  const teamIds = standings.map(s => s.teamId);
  const teams = await Team.find({ _id: { $in: teamIds } }).lean();
  const teamMap = new Map(teams.map(t => [t._id.toString(), t]));

  return standings.map((s, index) => {
    const team = teamMap.get(s.teamId);
    const form = s.recentMatches
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5)
      .map(m => m.result);

    return {
      team: {
        _id: s.teamId,
        name: team?.name || '',
        shortName: team?.shortName || '',
        slug: team?.slug || '',
        logo: team?.logo || '',
      },
      position: index + 1,
      played: s.played,
      won: s.won,
      drawn: s.drawn,
      lost: s.lost,
      goalsFor: s.goalsFor,
      goalsAgainst: s.goalsAgainst,
      goalDifference: s.goalsFor - s.goalsAgainst,
      points: s.points,
      form,
    };
  });
}
```

## Sortowanie Head-to-Head

```typescript
// lib/standings.ts (kontynuacja)

interface TeamStats {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  recentMatches: { result: 'W' | 'D' | 'L'; date: Date }[];
}

async function sortWithHeadToHead(
  stats: TeamStats[],
  matches: any[]
): Promise<TeamStats[]> {
  // Sortowanie podstawowe po punktach
  stats.sort((a, b) => b.points - a.points);

  // Grupuj drużyny z tą samą liczbą punktów
  const result: TeamStats[] = [];
  let i = 0;

  while (i < stats.length) {
    const currentPoints = stats[i].points;
    const samePointsTeams: TeamStats[] = [];
    
    while (i < stats.length && stats[i].points === currentPoints) {
      samePointsTeams.push(stats[i]);
      i++;
    }

    if (samePointsTeams.length === 1) {
      result.push(samePointsTeams[0]);
    } else {
      // Sortuj head-to-head
      const sorted = sortGroupByHeadToHead(samePointsTeams, matches);
      result.push(...sorted);
    }
  }

  return result;
}

function sortGroupByHeadToHead(
  teams: TeamStats[],
  allMatches: any[]
): TeamStats[] {
  const teamIds = new Set(teams.map(t => t.teamId));
  
  // Filtruj mecze bezpośrednie między drużynami w grupie
  const h2hMatches = allMatches.filter(m => 
    teamIds.has(m.homeTeam.toString()) && 
    teamIds.has(m.awayTeam.toString())
  );

  // Oblicz mini-tabelę head-to-head
  const h2hStats = new Map<string, {
    points: number;
    goalDiff: number;
    goalsFor: number;
  }>();

  for (const team of teams) {
    h2hStats.set(team.teamId, { points: 0, goalDiff: 0, goalsFor: 0 });
  }

  for (const match of h2hMatches) {
    const homeId = match.homeTeam.toString();
    const awayId = match.awayTeam.toString();
    const homeH2H = h2hStats.get(homeId)!;
    const awayH2H = h2hStats.get(awayId)!;

    homeH2H.goalsFor += match.homeScore;
    awayH2H.goalsFor += match.awayScore;
    homeH2H.goalDiff += match.homeScore - match.awayScore;
    awayH2H.goalDiff += match.awayScore - match.homeScore;

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
  return teams.sort((a, b) => {
    const aH2H = h2hStats.get(a.teamId)!;
    const bH2H = h2hStats.get(b.teamId)!;

    // 1. Punkty head-to-head
    if (bH2H.points !== aH2H.points) return bH2H.points - aH2H.points;
    
    // 2. Różnica bramek head-to-head
    if (bH2H.goalDiff !== aH2H.goalDiff) return bH2H.goalDiff - aH2H.goalDiff;
    
    // 3. Bramki strzelone head-to-head
    if (bH2H.goalsFor !== aH2H.goalsFor) return bH2H.goalsFor - aH2H.goalsFor;
    
    // 4. Różnica bramek ogółem
    const aGD = a.goalsFor - a.goalsAgainst;
    const bGD = b.goalsFor - b.goalsAgainst;
    if (bGD !== aGD) return bGD - aGD;
    
    // 5. Bramki strzelone ogółem
    return b.goalsFor - a.goalsFor;
  });
}
```

## API Route z Cache

```typescript
// app/api/v1/standings/route.ts
import { NextResponse } from 'next/server';
import { calculateStandings } from '@/lib/standings';
import { connectDB } from '@/lib/mongodb';
import { League } from '@/models/League';

export const revalidate = 0; // Dynamiczne, używamy revalidateTag

export async function GET() {
  try {
    await connectDB();
    
    const league = await League.findOne({ country: 'PL' }).lean();
    if (!league) {
      return NextResponse.json(
        { error: { message: 'Liga nie znaleziona', code: 'LEAGUE_NOT_FOUND' } },
        { status: 404 }
      );
    }

    const standings = await calculateStandings(league.currentSeason);

    return NextResponse.json({
      data: standings,
      meta: {
        season: league.currentSeason,
        currentRound: league.currentRound,
        lastUpdated: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Standings error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
```

## Revalidation po zapisie wyniku

```typescript
// app/api/v1/matches/[id]/result/route.ts
import { revalidateTag } from 'next/cache';

// Po zapisie wyniku:
revalidateTag('standings');
revalidateTag('matches');
```

## Testowanie

```typescript
// Przykładowy test head-to-head
describe('sortGroupByHeadToHead', () => {
  it('should sort teams by head-to-head when points are equal', () => {
    const teams = [
      { teamId: 'A', points: 10, goalsFor: 15, goalsAgainst: 10 },
      { teamId: 'B', points: 10, goalsFor: 12, goalsAgainst: 8 },
    ];
    const matches = [
      { homeTeam: 'A', awayTeam: 'B', homeScore: 1, awayScore: 2 },
      { homeTeam: 'B', awayTeam: 'A', homeScore: 0, awayScore: 0 },
    ];
    // B wygrał 4 pkt head-to-head vs A 1 pkt
    // Oczekiwany wynik: [B, A]
  });
});
```
