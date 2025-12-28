# Ekstraklasa Tracker

Next.js 14 (App Router) + TypeScript + MongoDB + Tailwind + shadcn/ui
Aplikacja do śledzenia wyników polskiej Ekstraklasy, inspirowana SofaScore.

## 🔴 KRYTYCZNE ZASADY (zawsze przestrzegaj!)

1. **Standing = PROJEKCJA, nie kolekcja!** Tabela wyliczana z agregacji Match
2. **Head-to-head sorting** wg zasad Ekstraklasy przy równych punktach
3. **currentRound** - terminarz domyślnie pokazuje aktualną kolejkę
4. **Zod validation** - FINISHED wymaga homeScore + awayScore
5. **revalidateTag** dla cache (standings, matches, teams, league)

## Struktura

```
app/(public)/     → Server Components (tabela, terminarz)
app/admin/        → Client Components + requireAdmin()
app/api/v1/       → API versioning
lib/standings.ts  → calculateStandings() + head-to-head
lib/auth-utils.ts → requireAdmin() wrapper
models/           → User, Team, Match, League (NIE Standing!)
```

## Komendy

```bash
pnpm dev          # localhost:3000
pnpm lint         # ESLint
pnpm type-check   # TypeScript
pnpm build        # Production build
pnpm seed         # Seed bazy danych
```

## Środowisko deweloperskie

### Baza danych
Development używa lokalnego MongoDB w Docker (nie Atlas!).

### Komendy Docker
```bash
# Uruchom MongoDB (jednorazowo po instalacji Docker)
docker run -d -p 27017:27017 --name mongo mongo:7

# Start MongoDB (po restarcie komputera)
docker start mongo

# Sprawdź status
docker ps | grep mongo

# Zatrzymaj MongoDB
docker stop mongo
```

### Zmienne środowiskowe
- `.env.local` → produkcja (Atlas)
- `.env.development.local` → development (lokalne Docker)

## Post-Task Checklist

Po każdym TASK:
1. `pnpm lint`
2. `pnpm type-check`
3. Sprawdź czy Standing NIE jest kolekcją

## Dokumentacja

- **Architektura:** @docs/architecture.md
- **PRD kompletny:** @docs/PRD.md
- **Head-to-head logic:** @docs/head-to-head.md
- **Session handoff:** @docs/session-handoff.md

## Forbidden paths

NIE modyfikuj: node_modules/, .next/, .git/, *.lock

## Style

Dark theme (SofaScore-inspired):
- Tło: #1a1a2e / #16213e
- Akcent: #e94560 / #00d4ff
- Font: Outfit (display), DM Sans (body)

Używaj @skill:frontend-design dla komponentów UI.
