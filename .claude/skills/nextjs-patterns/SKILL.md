---
name: nextjs-patterns
description: Use when implementing Next.js features like auth wrappers, Server/Client components, API routes, caching with revalidateTag, or Zod validation. Provides patterns for Ekstraklasa Tracker architecture.
allowed-tools: Read, Write, Edit, Bash
---

# Next.js Patterns Skill

## requireAdmin() Wrapper

Centralny wrapper do ochrony tras admina:

```typescript
// lib/auth-utils.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }
  
  if (session.user.role !== 'ADMIN') {
    redirect('/unauthorized');
  }
  
  return session;
}

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }
  
  return session;
}

export async function getOptionalSession() {
  return await getServerSession(authOptions);
}
```

## Użycie w Admin Layout

```typescript
// app/admin/layout.tsx
import { requireAdmin } from '@/lib/auth-utils';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin(); // Automatyczny redirect jeśli nie admin
  
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
```

## Server vs Client Components Strategy

### Server Components (domyślne) - app/(public)/

```typescript
// app/(public)/page.tsx - Tabela ligowa
import { calculateStandings } from '@/lib/standings';
import { StandingsTable } from '@/components/standings-table';

// Cache z tagiem
export const revalidate = 3600; // 1 godzina backup

async function getStandings() {
  // Użyj fetch z tagiem dla revalidacji on-demand
  const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/v1/standings`, {
    next: { tags: ['standings'] }
  });
  return res.json();
}

export default async function HomePage() {
  const { data: standings } = await getStandings();
  
  return (
    <main>
      <h1>Tabela Ekstraklasy</h1>
      <StandingsTable standings={standings} />
    </main>
  );
}
```

### Client Components - app/admin/

```typescript
// app/admin/wyniki/page.tsx
'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { updateMatchResult } from '@/app/actions/matches';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function ResultsPage() {
  const { data, mutate } = useSWR('/api/v1/matches?status=SCHEDULED', fetcher);
  const [loading, setLoading] = useState(false);

  const handleSaveResult = async (matchId: string, homeScore: number, awayScore: number) => {
    setLoading(true);
    try {
      await updateMatchResult(matchId, homeScore, awayScore);
      mutate(); // Odśwież dane
    } finally {
      setLoading(false);
    }
  };

  return (/* UI */);
}
```

## Server Actions z Zod Validation

```typescript
// app/actions/matches.ts
'use server';

import { z } from 'zod';
import { revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/auth-utils';
import { Match } from '@/models/Match';
import { connectDB } from '@/lib/mongodb';

const updateResultSchema = z.object({
  matchId: z.string().min(1),
  homeScore: z.number().min(0).max(99),
  awayScore: z.number().min(0).max(99),
});

export async function updateMatchResult(
  matchId: string,
  homeScore: number,
  awayScore: number
) {
  // 1. Sprawdź uprawnienia
  await requireAdmin();

  // 2. Walidacja Zod
  const parsed = updateResultSchema.safeParse({ matchId, homeScore, awayScore });
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0].message);
  }

  // 3. Zapis do bazy
  await connectDB();
  await Match.findByIdAndUpdate(matchId, {
    homeScore,
    awayScore,
    status: 'FINISHED',
  });

  // 4. Rewalidacja cache
  revalidateTag('standings');
  revalidateTag('matches');

  return { success: true };
}
```

## API Route Pattern

```typescript
// app/api/v1/teams/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Team } from '@/models/Team';

// GET - publiczny
export async function GET() {
  try {
    await connectDB();
    const teams = await Team.find().sort({ name: 1 }).lean();
    
    return NextResponse.json({ data: teams });
  } catch (error) {
    return NextResponse.json(
      { error: { message: 'Internal error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}

// POST - wymaga admina
export async function POST(req: NextRequest) {
  try {
    // Sprawdź auth przez API
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await req.json();
    
    // Walidacja Zod
    const parsed = createTeamSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: parsed.error.errors[0].message, code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }

    const team = await Team.create(parsed.data);
    revalidateTag('teams');
    
    return NextResponse.json({ data: team }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: { message: 'Internal error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
```

## Zod Schemas

```typescript
// lib/validations/match.ts
import { z } from 'zod';

export const createMatchSchema = z.object({
  homeTeam: z.string().min(1, 'Wybierz drużynę gospodarzy'),
  awayTeam: z.string().min(1, 'Wybierz drużynę gości'),
  round: z.number().min(1).max(34),
  season: z.string().regex(/^\d{4}\/\d{4}$/, 'Format: 2024/2025'),
  date: z.string().datetime(),
  stadium: z.string().optional(),
}).refine(
  (data) => data.homeTeam !== data.awayTeam,
  { message: 'Drużyny muszą być różne' }
);

export const updateResultSchema = z.object({
  homeScore: z.number().min(0).max(99),
  awayScore: z.number().min(0).max(99),
  status: z.enum(['SCHEDULED', 'LIVE', 'FINISHED', 'POSTPONED', 'CANCELLED']),
}).refine(
  (data) => {
    // 🔴 FINISHED wymaga wyniku
    if (data.status === 'FINISHED') {
      return data.homeScore !== undefined && data.awayScore !== undefined;
    }
    return true;
  },
  { message: 'Nie można zakończyć meczu bez podania wyniku' }
);
```

## revalidateTag Strategy

| Tag | Kiedy revalidować |
|-----|-------------------|
| `standings` | Po zapisie wyniku, edycji meczu |
| `matches` | Po CRUD meczu, zapisie wyniku |
| `teams` | Po CRUD drużyny |
| `league` | Po zmianie currentRound |

```typescript
// Przykład: zmiana currentRound
import { revalidateTag } from 'next/cache';

await League.findByIdAndUpdate(leagueId, { currentRound: newRound });
revalidateTag('league');
revalidateTag('matches'); // Bo terminarz zależy od currentRound
```

## Error Boundary

```typescript
// app/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Coś poszło nie tak!</h2>
        <p className="mt-2 text-gray-400">{error.message}</p>
        <button
          onClick={reset}
          className="mt-4 rounded bg-accent px-4 py-2"
        >
          Spróbuj ponownie
        </button>
      </div>
    </div>
  );
}
```
