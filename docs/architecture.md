# Architektura Ekstraklasa Tracker

## Przegląd

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
├─────────────────────────────────────────────────────────────┤
│  app/(public)/          │  app/admin/                       │
│  ─────────────          │  ───────────                      │
│  Server Components      │  Client Components                │
│  - Tabela               │  - CRUD drużyny                   │
│  - Terminarz            │  - CRUD mecze                     │
│  - Profil drużyny       │  - Wprowadzanie wyników           │
│  - Szczegóły meczu      │  - Dashboard                      │
│                         │  + requireAdmin()                 │
└─────────────────────────┴───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API LAYER                               │
├─────────────────────────────────────────────────────────────┤
│  app/api/v1/                                                │
│  ────────────                                               │
│  /standings     → calculateStandings() → Cache              │
│  /matches       → CRUD + revalidateTag                      │
│  /teams         → CRUD + revalidateTag                      │
│  /league        → currentRound + revalidateTag              │
│  /auth/[...]    → NextAuth.js                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                              │
├─────────────────────────────────────────────────────────────┤
│  MongoDB Atlas                                              │
│  ──────────────                                             │
│  Collections:                                               │
│  - users        → NextAuth.js sessions                      │
│  - teams        → 18 drużyn Ekstraklasy                     │
│  - matches      → 306 meczów/sezon (JEDYNE ŹRÓDŁO PRAWDY)   │
│  - leagues      → Metadane ligi + currentRound              │
│                                                             │
│  ⚠️ NIE MA KOLEKCJI STANDINGS!                              │
│  Tabela = agregacja z matches                               │
└─────────────────────────────────────────────────────────────┘
```

## Modele danych

### User (NextAuth.js)
```typescript
interface User {
  _id: ObjectId;
  email: string;        // unique, indexed
  password: string;     // hashed (bcrypt)
  name?: string;
  role: 'USER' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
}
```

### League
```typescript
interface League {
  _id: ObjectId;
  name: string;           // "Ekstraklasa"
  country: string;        // "PL"
  logo?: string;
  currentSeason: string;  // "2024/2025"
  currentRound: number;   // 🔴 Aktualna kolejka (1-34)
  totalRounds: number;    // 34
  teamsCount: number;     // 18
}
```

### Team
```typescript
interface Team {
  _id: ObjectId;
  leagueId: ObjectId;     // ref: League (multi-liga ready)
  name: string;           // "Lech Poznań"
  shortName: string;      // "LEP" (3 znaki)
  slug: string;           // "lech-poznan" (unique, indexed)
  logo?: string;
  stadium?: string;
  city?: string;
  founded?: number;
  colors?: {
    primary: string;
    secondary: string;
  };
}

// Indeksy
db.teams.createIndex({ slug: 1 }, { unique: true });
db.teams.createIndex({ leagueId: 1 });
```

### Match (JEDYNE ŹRÓDŁO PRAWDY)
```typescript
interface Match {
  _id: ObjectId;
  leagueId: ObjectId;
  homeTeam: ObjectId;     // ref: Team
  awayTeam: ObjectId;     // ref: Team
  homeScore: number | null;
  awayScore: number | null;
  round: number;          // 1-34
  season: string;         // "2024/2025"
  date: Date;
  time?: string;
  stadium?: string;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED' | 'CANCELLED';
  // Future: liveData dla LIVE
}

// Indeksy (krytyczne dla wydajności!)
db.matches.createIndex({ season: 1, round: 1 });
db.matches.createIndex({ homeTeam: 1, season: 1 });
db.matches.createIndex({ awayTeam: 1, season: 1 });
db.matches.createIndex({ status: 1, date: 1 });
db.matches.createIndex({ leagueId: 1, season: 1 });
```

## Standing - PROJEKCJA (nie model!)

```typescript
// lib/standings.ts - TypeScript interface
interface Standing {
  team: TeamInfo;
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

// Wyliczane przez calculateStandings()
// Zobacz: @.claude/skills/ekstraklasa-standings/SKILL.md
```

## Cache Strategy

| Endpoint | Cache Type | Tag | Revalidation |
|----------|-----------|-----|--------------|
| `/api/v1/standings` | On-demand | `standings` | Po zapisie wyniku |
| `/api/v1/matches` | On-demand | `matches` | Po CRUD meczu |
| `/api/v1/teams` | On-demand | `teams` | Po CRUD drużyny |
| `/api/v1/league` | On-demand | `league` | Po zmianie currentRound |

```typescript
// Revalidation flow
const saveResult = async () => {
  await Match.findByIdAndUpdate(id, { homeScore, awayScore, status: 'FINISHED' });
  revalidateTag('standings');  // Tabela się zmieni
  revalidateTag('matches');    // Lista meczów się zmieni
};
```

## Auth Flow

```
┌──────────┐    ┌──────────┐    ┌──────────┐
│  Login   │ -> │ NextAuth │ -> │ Session  │
│  Form    │    │   API    │    │  Cookie  │
└──────────┘    └──────────┘    └──────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────┐
│  Server Component / API Route            │
│  ────────────────────────────────        │
│  const session = await getServerSession()│
│  if (session?.user.role === 'ADMIN') {   │
│    // OK                                 │
│  }                                       │
└──────────────────────────────────────────┘
```

## Struktura plików

```
ekstraklasa-tracker/
├── app/
│   ├── (public)/                 # Route group - publiczne
│   │   ├── page.tsx              # Tabela ligowa
│   │   ├── terminarz/
│   │   │   └── page.tsx          # Lista meczów (currentRound domyślnie)
│   │   ├── mecz/
│   │   │   └── [id]/page.tsx     # Szczegóły meczu
│   │   └── druzyna/
│   │       └── [slug]/page.tsx   # Profil drużyny
│   │
│   ├── (auth)/                   # Route group - auth
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   │
│   ├── admin/                    # Protected - requireAdmin()
│   │   ├── layout.tsx            # Sprawdza uprawnienia
│   │   ├── page.tsx              # Dashboard
│   │   ├── druzyny/
│   │   │   ├── page.tsx          # Lista drużyn
│   │   │   ├── nowa/page.tsx     # Formularz dodawania
│   │   │   └── [id]/page.tsx     # Edycja drużyny
│   │   ├── mecze/
│   │   │   ├── page.tsx          # Lista meczów
│   │   │   ├── nowy/page.tsx     # Formularz dodawania
│   │   │   └── [id]/page.tsx     # Edycja meczu
│   │   └── wyniki/
│   │       └── page.tsx          # Wprowadzanie wyników
│   │
│   ├── api/
│   │   └── v1/                   # API versioning
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── standings/route.ts
│   │       ├── matches/
│   │       │   ├── route.ts      # GET all, POST new
│   │       │   └── [id]/
│   │       │       ├── route.ts  # GET, PUT, DELETE
│   │       │       └── result/route.ts  # POST result
│   │       ├── teams/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       └── league/
│   │           ├── route.ts
│   │           └── current-round/route.ts
│   │
│   ├── actions/                  # Server Actions
│   │   ├── matches.ts
│   │   ├── teams.ts
│   │   └── league.ts
│   │
│   ├── layout.tsx
│   ├── error.tsx
│   ├── not-found.tsx
│   └── globals.css
│
├── components/
│   ├── ui/                       # shadcn/ui
│   ├── standings-table.tsx
│   ├── match-card.tsx
│   ├── team-card.tsx
│   ├── round-selector.tsx
│   ├── admin-sidebar.tsx
│   └── ...
│
├── lib/
│   ├── mongodb.ts                # Połączenie z MongoDB
│   ├── auth.ts                   # NextAuth config
│   ├── auth-utils.ts             # requireAdmin(), requireAuth()
│   ├── standings.ts              # calculateStandings()
│   ├── utils.ts                  # cn(), formatDate(), etc.
│   └── validations/
│       ├── match.ts              # Zod schemas
│       ├── team.ts
│       └── league.ts
│
├── models/
│   ├── User.ts
│   ├── Team.ts
│   ├── Match.ts
│   └── League.ts
│
├── types/
│   ├── standing.ts               # Standing interface (nie model!)
│   ├── next-auth.d.ts            # Session type extensions
│   └── index.ts
│
├── docs/
│   ├── PRD.md
│   ├── architecture.md           # Ten plik
│   ├── head-to-head.md
│   └── session-handoff.md
│
├── CLAUDE.md
├── .claude/
│   ├── settings.json
│   ├── hooks/
│   ├── skills/
│   └── commands/
│
├── tailwind.config.ts
├── next.config.js
├── package.json
└── tsconfig.json
```

## Env Variables

```env
# .env.local (NIE COMMITUJ!)
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000

# .env.example (DO REPO)
MONGODB_URI=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

## Performance Considerations

1. **Indeksy MongoDB** - krytyczne dla agregacji standings
2. **revalidateTag** - unikaj revalidateAll()
3. **Server Components** - domyślnie dla publicznych stron
4. **Lean queries** - `.lean()` dla read-only
5. **Pagination** - dla listy meczów (34 kolejki × 9 meczów = 306)
