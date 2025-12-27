# PRD: Ekstraklasa Tracker

## 📋 Informacje o dokumencie

| Pole | Wartość |
|------|---------|
| Nazwa projektu | Ekstraklasa Tracker |
| Wersja | 1.1.0 |
| Data utworzenia | 2025-12-27 |
| Ostatnia aktualizacja | 2025-12-27 |
| Autor | Artur Jabłoński |
| Status | DRAFT |

---

## 🎯 Wizja produktu

**Ekstraklasa Tracker** to aplikacja webowa do śledzenia wyników, tabeli ligowej i terminarza polskiej Ekstraklasy. Inspirowana UI/UX aplikacji SofaScore — czytelna, szybka, z ciemnym motywem i naciskiem na dane sportowe.

### Problem
Kibice Ekstraklasy potrzebują szybkiego dostępu do aktualnych wyników, tabeli i terminarza w jednym miejscu, bez reklam i zbędnych elementów.

### Rozwiązanie
Minimalistyczna aplikacja z:
- Tabelą ligową **wyliczaną w locie** z wyników meczów
- Terminarzem z automatycznym scrollem do **aktualnej kolejki**
- Panelem admina do zarządzania wynikami

---

## 👥 Grupy użytkowników

### 1. Kibic (USER) — bez logowania
- Przegląda tabelę ligową
- Sprawdza terminarz i wyniki
- Filtruje mecze po drużynie/kolejce
- Widzi szczegóły meczu

### 2. Zalogowany użytkownik (USER)
- Wszystko co kibic
- Może dodawać ulubione drużyny (future feature)
- Historia przeglądanych meczów (future feature)

### 3. Administrator (ADMIN)
- Zarządza drużynami (CRUD)
- Zarządza meczami (CRUD)
- Wprowadza wyniki meczów
- Widzi dashboard ze statystykami

---

## ✨ Funkcje MVP

### Moduł: Strona publiczna

| ID | Funkcja | Opis | Priorytet |
|----|---------|------|-----------|
| P01 | Tabela ligowa | Wyliczana w locie z agregacji Match, sortowanie wg zasad Ekstraklasy | 🔴 MUST |
| P02 | Terminarz | Lista meczów, domyślnie pokazuje **currentRound** | 🔴 MUST |
| P03 | Filtrowanie terminarza | Po kolejce, drużynie, statusie (rozegrane/nadchodzące) | 🔴 MUST |
| P04 | Widok meczu | Szczegóły: drużyny, wynik, data, stadion, kolejka | 🟡 SHOULD |
| P05 | Widok drużyny | Profil drużyny: logo, stadion, mecze, pozycja w tabeli | 🟡 SHOULD |
| P06 | Wyszukiwarka | Szybkie wyszukiwanie drużyn i meczów | 🟢 COULD |

### Moduł: Autoryzacja

| ID | Funkcja | Opis | Priorytet |
|----|---------|------|-----------|
| A01 | Rejestracja | Email + hasło + potwierdzenie | 🔴 MUST |
| A02 | Logowanie | Email + hasło | 🔴 MUST |
| A03 | Wylogowanie | Usunięcie sesji | 🔴 MUST |
| A04 | Role użytkowników | USER / ADMIN | 🔴 MUST |
| A05 | Centralny `requireAdmin()` | Wrapper do ochrony tras admina | 🔴 MUST |
| A06 | Reset hasła | Email z linkiem do resetu | 🟢 COULD |

### Moduł: Panel Admina

| ID | Funkcja | Opis | Priorytet |
|----|---------|------|-----------|
| AD01 | Dashboard | Statystyki: mecze rozegrane, do rozegrania, drużyny | 🟡 SHOULD |
| AD02 | CRUD Drużyny | Dodaj/edytuj/usuń drużynę | 🔴 MUST |
| AD03 | CRUD Mecze | Dodaj/edytuj/usuń mecz | 🔴 MUST |
| AD04 | Wprowadzanie wyników | Formularz z walidacją Zod + `revalidateTag` | 🔴 MUST |
| AD05 | Ustawienie currentRound | Zarządzanie aktualną kolejką | 🔴 MUST |
| AD06 | Import danych | CSV/JSON z meczami sezonu | 🟢 COULD |

---

## 🏗️ Kluczowe decyzje architektoniczne

### 🔴 Krytyczne (przed kodowaniem)

#### 1. Standing jako projekcja (nie osobna kolekcja!)

**Problem:** Przechowywanie tabeli jako osobnych dokumentów prowadzi do błędów synchronizacji przy edycji starych wyników.

**Rozwiązanie:** Tabela jest **zawsze wyliczana w locie** przez agregację MongoDB z kolekcji `Match`. Opcjonalnie cache'owana z `revalidateTag`.

```javascript
// ❌ ŹLE - Standing jako osobna kolekcja
await Standing.findOneAndUpdate({ team: teamId }, { points: newPoints });

// ✅ DOBRZE - Standing wyliczany z Match
const standings = await Match.aggregate([
  { $match: { season, status: 'FINISHED' } },
  // ... agregacja wyliczająca punkty, bramki, etc.
]);
```

#### 2. Zasada bezpośrednich meczów (Ekstraklasa)

**Kolejność przy równej liczbie punktów:**
1. Punkty w meczach bezpośrednich
2. Różnica bramek w meczach bezpośrednich
3. Bramki strzelone w meczach bezpośrednich
4. Różnica bramek ogółem
5. Bramki strzelone ogółem

```javascript
// Agregacja musi uwzględniać head-to-head
function sortByHeadToHead(teams) {
  // 1. Grupuj drużyny z tą samą liczbą punktów
  // 2. Dla każdej grupy oblicz mini-tabelę meczów bezpośrednich
  // 3. Sortuj według zasad Ekstraklasy
}
```

#### 3. Transakcje MongoDB

Zapis wyniku + przeliczenie tabeli (jeśli cache) w jednej transakcji:

```javascript
const session = await mongoose.startSession();
session.startTransaction();
try {
  await Match.findByIdAndUpdate(matchId, { homeScore, awayScore, status: 'FINISHED' }, { session });
  await session.commitTransaction();
  revalidateTag('standings'); // Next.js cache
} catch (error) {
  await session.abortTransaction();
  throw error;
}
```

#### 4. Indeksy MongoDB

```javascript
// Team
teamSchema.index({ slug: 1 }, { unique: true });
teamSchema.index({ leagueId: 1 });

// Match
matchSchema.index({ season: 1, round: 1 });
matchSchema.index({ homeTeam: 1, season: 1 });
matchSchema.index({ awayTeam: 1, season: 1 });
matchSchema.index({ status: 1, date: 1 });
matchSchema.index({ leagueId: 1, season: 1 });
```

#### 5. Jedno źródło prawdy

| Dane | Źródło | Projekcja/Cache |
|------|--------|-----------------|
| Wynik meczu | `Match.homeScore`, `Match.awayScore` | - |
| Tabela | Agregacja z `Match` | Cache z `revalidateTag` |
| Forma drużyny | Agregacja z `Match` (ostatnie 5) | - |
| Statystyki | Agregacja z `Match` | - |

---

### 🟡 Ważne (architektura/skalowalność)

#### 1. API Versioning

```
/api/v1/teams
/api/v1/matches
/api/v1/standings
```

#### 2. Centralny Auth Wrapper

```typescript
// lib/auth-utils.ts
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }
  return session;
}
```

#### 3. Strategia fetchowania

| Strona | Typ | Metoda | Cache |
|--------|-----|--------|-------|
| Tabela (public) | Server Component | `fetch` + `revalidateTag` | Static + on-demand |
| Terminarz (public) | Server Component | `fetch` + `revalidateTag` | Static + on-demand |
| Mecz (public) | Server Component | `fetch` | Static |
| Admin Dashboard | Client Component | `useSWR` / `useQuery` | Real-time |
| Admin Forms | Client Component | Server Actions | - |

#### 4. Spójny Error Handling

```typescript
// app/error.tsx - globalny error boundary
// app/not-found.tsx - 404
// app/api/v1/[...]/route.ts - spójny format błędów JSON
{
  error: {
    message: string,
    code: string
  }
}
```

---

### 🟢 Dobre do rozwoju (opcjonalne)

#### 1. Event-driven flow (przyszłość)
```
MATCH_RESULT_UPDATED → recalculateStandings() → revalidateTag('standings')
```

#### 2. Przygotowanie na multi-liga
```javascript
// Dodaj leagueId do modeli
leagueId: { type: Schema.Types.ObjectId, ref: 'League' }
```

#### 3. Feature flag LIVE
```javascript
status: ['SCHEDULED', 'LIVE', 'FINISHED', 'POSTPONED', 'CANCELLED']
liveData: { minute: Number, events: [] }
```

---

## 🗄️ Model danych (MongoDB/Mongoose)

### User
```javascript
{
  _id: ObjectId,
  email: String,           // unique, required, indexed
  password: String,        // hashed, required
  name: String,
  role: String,            // 'USER' | 'ADMIN', default: 'USER'
  createdAt: Date,
  updatedAt: Date
}
```

### League (przygotowanie na multi-liga)
```javascript
{
  _id: ObjectId,
  name: String,            // "Ekstraklasa"
  country: String,         // "PL"
  logo: String,
  currentSeason: String,   // "2024/2025"
  currentRound: Number,    // 🔴 Aktualna kolejka do wyświetlenia
  totalRounds: Number,     // 34
  teamsCount: Number,      // 18
  createdAt: Date,
  updatedAt: Date
}
```

### Team
```javascript
{
  _id: ObjectId,
  leagueId: ObjectId,      // ref: League (multi-liga ready)
  name: String,            // "Lech Poznań"
  shortName: String,       // "LEP" (3 litery)
  slug: String,            // "lech-poznan", unique, indexed
  logo: String,
  stadium: String,
  city: String,
  founded: Number,
  colors: {
    primary: String,
    secondary: String
  },
  createdAt: Date,
  updatedAt: Date
}

// Indeksy
teamSchema.index({ slug: 1 }, { unique: true });
teamSchema.index({ leagueId: 1 });
```

### Match (JEDYNE ŹRÓDŁO PRAWDY dla wyników)
```javascript
{
  _id: ObjectId,
  leagueId: ObjectId,      // ref: League
  homeTeam: ObjectId,      // ref: Team, indexed
  awayTeam: ObjectId,      // ref: Team, indexed
  homeScore: Number,       // null jeśli nie rozegrany
  awayScore: Number,       // null jeśli nie rozegrany
  round: Number,           // kolejka (1-34), indexed
  season: String,          // "2024/2025", indexed
  date: Date,
  time: String,
  stadium: String,
  status: {
    type: String,
    enum: ['SCHEDULED', 'LIVE', 'FINISHED', 'POSTPONED', 'CANCELLED'],
    default: 'SCHEDULED'
  },
  // Przygotowanie na LIVE (future)
  liveData: {
    minute: Number,
    events: [{
      type: String,        // 'GOAL', 'YELLOW', 'RED'
      minute: Number,
      team: String,
      player: String
    }]
  },
  createdAt: Date,
  updatedAt: Date
}

// Indeksy
matchSchema.index({ season: 1, round: 1 });
matchSchema.index({ homeTeam: 1, season: 1 });
matchSchema.index({ awayTeam: 1, season: 1 });
matchSchema.index({ status: 1, date: 1 });
matchSchema.index({ leagueId: 1, season: 1 });
```

### ⚠️ Standing - NIE JEST KOLEKCJĄ!

Tabela to **projekcja** wyliczana przez agregację z `Match`:

```typescript
// lib/standings.ts - TypeScript interface, nie Mongoose model
interface Standing {
  team: Team;
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
  // Agregacja z Match + sortowanie head-to-head
}
```

---

## 🔒 Walidacja Zod

```typescript
// lib/validations/match.ts
export const updateResultSchema = z.object({
  homeScore: z.number().min(0).max(99),
  awayScore: z.number().min(0).max(99),
  status: z.enum(['SCHEDULED', 'LIVE', 'FINISHED', 'POSTPONED', 'CANCELLED']),
}).refine(
  (data) => {
    // 🔴 Nie można ustawić FINISHED bez wyniku
    if (data.status === 'FINISHED') {
      return data.homeScore !== undefined && data.awayScore !== undefined;
    }
    return true;
  },
  { message: 'Nie można zakończyć meczu bez podania wyniku' }
);
```

---

## 🎨 UI/UX — Inspiracja SofaScore

### Kierunek estetyczny
**Dark Theme + Sports Data Focus**

| Element | Styl |
|---------|------|
| **Motyw** | Ciemny (dark mode domyślnie) |
| **Kolory** | Tło: #1a1a2e / #16213e, Akcent: #e94560 / #00d4ff |
| **Typografia** | Bold dla wyników, clean sans-serif (Outfit, DM Sans) |
| **Layout** | Mobile-first, card-based, sticky header |

### UX: currentRound
```
📅 TERMINARZ
[← Kolejka 14] KOLEJKA 15 [16 →]   ← Domyślnie currentRound!
```

---

## 🛠️ Stack technologiczny

| Warstwa | Technologia |
|---------|-------------|
| **Framework** | Next.js 14+ (App Router) |
| **Język** | TypeScript |
| **Styling** | Tailwind CSS |
| **UI Components** | shadcn/ui + frontend-design skill |
| **Backend** | Next.js API Routes |
| **Baza danych** | MongoDB Atlas |
| **ODM** | Mongoose |
| **Autoryzacja** | NextAuth.js |
| **Walidacja** | Zod |
| **Cache** | Next.js `revalidateTag` |
| **Deploy** | Vercel |
| **MCP** | Context7 |

---

## 📁 Struktura projektu

```
ekstraklasa-tracker/
├── app/
│   ├── (public)/                 # Server Components
│   │   ├── page.tsx              # Tabela
│   │   ├── terminarz/page.tsx    # Domyślnie currentRound
│   │   ├── mecz/[id]/page.tsx
│   │   └── druzyna/[slug]/page.tsx
│   │
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   │
│   ├── admin/                    # Client Components
│   │   ├── layout.tsx            # requireAdmin()
│   │   ├── page.tsx
│   │   ├── druzyny/
│   │   ├── mecze/
│   │   └── wyniki/
│   │
│   ├── api/v1/                   # API versioning
│   │   ├── auth/[...nextauth]/
│   │   ├── teams/
│   │   ├── matches/
│   │   ├── standings/            # Agregacja, nie CRUD
│   │   └── league/
│   │
│   ├── error.tsx
│   ├── not-found.tsx
│   └── layout.tsx
│
├── components/
├── lib/
│   ├── mongodb.ts
│   ├── auth.ts
│   ├── auth-utils.ts             # requireAdmin()
│   ├── standings.ts              # calculateStandings() + head-to-head
│   └── validations/
│
├── models/
│   ├── User.ts
│   ├── Team.ts
│   ├── Match.ts
│   └── League.ts
│
├── types/
│   └── standing.ts               # TypeScript type, nie model
│
├── docs/
│   └── PRD.md
│
├── CLAUDE.md
└── .claude/
```

---

## 📊 API Endpoints

### Public — Server Components

| Method | Endpoint | Cache |
|--------|----------|-------|
| GET | `/api/v1/standings` | `revalidateTag('standings')` |
| GET | `/api/v1/matches?round=15` | `revalidateTag('matches')` |
| GET | `/api/v1/teams` | `revalidateTag('teams')` |
| GET | `/api/v1/league/current` | `revalidateTag('league')` |

### Protected — requireAdmin()

| Method | Endpoint | Revalidate |
|--------|----------|------------|
| POST | `/api/v1/matches/[id]/result` | `matches`, `standings` |
| PUT | `/api/v1/league/current-round` | `league` |
| POST/PUT/DELETE | `/api/v1/teams/...` | `teams` |
| POST/PUT/DELETE | `/api/v1/matches/...` | `matches` |

---

## 📅 Fazy implementacji

| Faza | Zakres | Dni |
|------|--------|-----|
| **1** | Setup + Modele + Indeksy + API struktura | 1-2 |
| **2** | `calculateStandings()` + head-to-head + Zod | 3 |
| **3** | Strona publiczna + currentRound UX | 4-5 |
| **4** | NextAuth.js + requireAdmin() | 6 |
| **5** | Panel Admina + revalidateTag | 7-8 |
| **6** | Polish + Seed + Deploy | 9-10 |

---

## ✅ Kryteria akceptacji MVP

### Funkcjonalne
- [ ] Tabela wyliczana z agregacji (nie osobna kolekcja)
- [ ] Sortowanie head-to-head wg zasad Ekstraklasy
- [ ] Terminarz domyślnie pokazuje currentRound
- [ ] Nie można zakończyć meczu bez wyniku (Zod)

### Techniczne
- [ ] Indeksy na season/round/team/slug
- [ ] API `/api/v1/...`
- [ ] Centralny `requireAdmin()`
- [ ] `revalidateTag` cache

---

## 📝 Changelog

### v1.1.0 (2025-12-27)
- 🔴 Standing jako projekcja (agregacja z Match)
- 🔴 Zasada head-to-head
- 🔴 Transakcje MongoDB
- 🔴 Indeksy DB
- 🔴 Walidacja Zod (FINISHED wymaga wyniku)
- 🔴 currentRound UX
- 🟡 API versioning `/api/v1/`
- 🟡 `requireAdmin()` wrapper
- 🟡 Server vs Client Components strategy
- 🟡 Error handling
- 🟢 League model (multi-liga ready)
- 🟢 liveData (LIVE ready)

---

*PRD v1.1.0 — Ekstraklasa Tracker*
