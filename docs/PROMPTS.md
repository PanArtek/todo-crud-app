# Prompty Claude Code — Ekstraklasa Tracker

Zestaw zoptymalizowanych promptów do budowy aplikacji.
Używaj w kolejności faz. Po każdej fazie: `/review`.

---

## 🔑 Zasady używania

1. **Jeden prompt = jedno zadanie** (nie łącz!)
2. **`/clear` między niezwiązanymi zadaniami**
3. **`think hard`** dla złożonych problemów
4. **Weryfikuj po każdym kroku**: `pnpm lint && pnpm type-check`
5. **Git sam** - nie pozwól Claude robić commit/push

---

## 🚀 FAZA 1: Setup + Modele + Indeksy (Dzień 1-2)

### 1.1 — Inicjalizacja projektu

```
Przeczytaj @docs/PRD.md i @docs/architecture.md.

Zainicjalizuj projekt Next.js 14 z App Router:
- TypeScript strict mode
- Tailwind CSS
- pnpm jako package manager

Zainstaluj dependencies:
- mongoose, mongodb
- next-auth, @auth/mongodb-adapter
- zod
- bcryptjs, @types/bcryptjs

Stwórz podstawową strukturę katalogów zgodnie z PRD.
NIE twórz jeszcze żadnych komponentów ani modeli.

Output: package.json, tsconfig.json, tailwind.config.ts, next.config.js
```

### 1.2 — Połączenie MongoDB

```
Stwórz lib/mongodb.ts z connection pooling dla MongoDB.

Wymagania:
- Cached connection (singleton pattern)
- Obsługa MONGODB_URI z env
- TypeScript types
- Error handling z sensownymi komunikatami

Stwórz też .env.example z wymaganymi zmiennymi.
```

### 1.3 — Modele Mongoose

```
Think hard.

Przeczytaj @docs/PRD.md sekcję "Model danych".

Stwórz modele Mongoose w models/:
1. User.ts - z role USER/ADMIN
2. League.ts - z currentRound, currentSeason
3. Team.ts - z indeksem na slug (unique)
4. Match.ts - JEDYNE ŹRÓDŁO PRAWDY dla wyników

KRYTYCZNE:
- NIE twórz modelu Standing (to projekcja!)
- Dodaj wszystkie indeksy z PRD
- Użyj timestamps: true
- TypeScript interfaces dla każdego modelu

Output: 4 pliki w models/ + types/index.ts z eksportami
```

### 1.4 — Struktura API

```
Stwórz szkielet API routes w app/api/v1/:

- standings/route.ts (tylko GET, placeholder)
- teams/route.ts (GET, POST placeholder)
- teams/[id]/route.ts (GET, PUT, DELETE placeholder)
- matches/route.ts (GET, POST placeholder)
- matches/[id]/route.ts (GET, PUT, DELETE placeholder)
- matches/[id]/result/route.ts (POST placeholder)
- league/route.ts (GET placeholder)
- league/current-round/route.ts (PUT placeholder)

Każdy endpoint zwraca: { data: null, message: "Not implemented" }
Dodaj spójny error handling format z PRD.
```

### ✅ Checkpoint Fazy 1

```
/review

Sprawdź:
- [ ] Projekt uruchamia się: pnpm dev
- [ ] 4 modele w models/ (NIE MA Standing!)
- [ ] Wszystkie indeksy dodane
- [ ] API routes odpowiadają placeholder
- [ ] pnpm lint && pnpm type-check - brak błędów
```

---

## 🧮 FAZA 2: Standings + Head-to-Head + Zod (Dzień 3)

### 2.1 — calculateStandings()

```
Think hard.

Przeczytaj @.claude/skills/ekstraklasa-standings/SKILL.md
Przeczytaj @docs/head-to-head.md

Zaimplementuj lib/standings.ts:

1. Interface Standing (NIE model Mongoose!)
2. Funkcja calculateStandings(season: string)
   - Pobiera FINISHED matches z MongoDB
   - Oblicza punkty, bramki, różnicę dla każdej drużyny
   - Oblicza formę (ostatnie 5 meczów)
   - Sortuje z uwzględnieniem head-to-head

3. Funkcja pomocnicza sortWithHeadToHead()
   - Grupuje drużyny z równą liczbą punktów
   - Dla każdej grupy oblicza mini-tabelę h2h
   - Sortuje wg zasad Ekstraklasy

KRYTYCZNE: Kolejność przy równych punktach:
1. Punkty h2h
2. Różnica bramek h2h
3. Bramki strzelone h2h
4. Różnica bramek ogółem
5. Bramki strzelone ogółem

Output: lib/standings.ts z pełną implementacją + komentarzami
```

### 2.2 — Zod Validations

```
Przeczytaj @docs/PRD.md sekcję "Walidacja Zod".

Stwórz lib/validations/:

1. match.ts:
   - createMatchSchema (homeTeam !== awayTeam)
   - updateMatchSchema
   - updateResultSchema (FINISHED wymaga homeScore i awayScore!)

2. team.ts:
   - createTeamSchema
   - updateTeamSchema

3. league.ts:
   - updateCurrentRoundSchema (1-34)

Każdy schema z polskimi komunikatami błędów.
Eksportuj wszystko z lib/validations/index.ts
```

### 2.3 — API Standings

```
Zaimplementuj app/api/v1/standings/route.ts:

GET /api/v1/standings
- Pobiera currentSeason z League
- Wywołuje calculateStandings()
- Zwraca { data: standings, meta: { season, currentRound, lastUpdated } }
- Cache z revalidateTag('standings')

Error handling:
- 404 jeśli liga nie istnieje
- 500 z logowaniem błędu

Użyj spójnego formatu odpowiedzi z PRD.
```

### ✅ Checkpoint Fazy 2

```
/review

Sprawdź:
- [ ] lib/standings.ts - calculateStandings() działa
- [ ] Head-to-head sortowanie zaimplementowane
- [ ] Zod schemas w lib/validations/
- [ ] API /api/v1/standings zwraca dane
- [ ] pnpm lint && pnpm type-check - brak błędów
```

---

## 🎨 FAZA 3: Strona publiczna + UI (Dzień 4-5)

### 3.1 — Layout + Theme

```
Przeczytaj @docs/PRD.md sekcję "UI/UX — Inspiracja SofaScore".

Stwórz app/layout.tsx i app/globals.css:

Dark theme SofaScore-inspired:
- Tło: #1a1a2e / #16213e
- Akcent: #e94560 / #00d4ff
- Font: Outfit (display), DM Sans (body)

Layout:
- Sticky header z logo i nawigacją
- Mobile-first responsive
- Tailwind CSS variables dla kolorów

Zainstaluj fonty przez next/font/google.
```

### 3.2 — Komponent StandingsTable

```
Think hard.

Stwórz components/standings-table.tsx (Server Component):

Props: standings: Standing[]

UI inspirowane SofaScore:
- Pozycja z kolorowym badge (1-3 zielone, 16-18 czerwone)
- Logo drużyny + nazwa
- M W D L GF GA GD Pkt
- Forma jako kolorowe kropki (W=green, D=gray, L=red)
- Hover effect na wierszach
- Sticky header tabeli

Mobile: ukryj niektóre kolumny, pokaż najważniejsze.
Użyj Tailwind, NIE shadcn/ui dla tego komponentu.
```

### 3.3 — Strona główna (Tabela)

```
Stwórz app/(public)/page.tsx (Server Component):

- Fetch standings z API (z revalidateTag)
- Wyświetl StandingsTable
- Header: "Tabela Ekstraklasy 2024/2025"
- Loading state z skeleton
- Error boundary

SEO: metadata z title i description.
```

### 3.4 — Terminarz z currentRound

```
Think hard.

Stwórz app/(public)/terminarz/page.tsx:

UX z PRD:
- Domyślnie pokazuje currentRound (z League)
- Nawigacja: [← Kolejka 14] KOLEJKA 15 [16 →]
- Lista meczów danej kolejki

Komponent MatchCard:
- Logo home vs Logo away
- Wynik (jeśli FINISHED) lub data/godzina
- Status badge (LIVE=czerwony pulsujący)

Filtrowanie:
- Po kolejce (1-34)
- Po drużynie (select)
- Po statusie (wszystkie/rozegrane/nadchodzące)

Server Component z searchParams dla filtrów.
```

### ✅ Checkpoint Fazy 3

```
/review

Sprawdź:
- [ ] Dark theme działa
- [ ] Tabela wyświetla się poprawnie
- [ ] Terminarz domyślnie pokazuje currentRound
- [ ] Nawigacja między kolejkami działa
- [ ] Mobile responsive
- [ ] pnpm lint && pnpm type-check - brak błędów
```

---

## 🔐 FAZA 4: Auth (Dzień 6)

### 4.1 — NextAuth.js Setup

```
Przeczytaj @.claude/skills/nextjs-patterns/SKILL.md

Stwórz lib/auth.ts z NextAuth config:

- CredentialsProvider (email + password)
- MongoDB adapter
- JWT strategy
- Session callback z role
- Bcrypt password hashing

Stwórz app/api/auth/[...nextauth]/route.ts

Types: rozszerz Session o user.role w types/next-auth.d.ts
```

### 4.2 — requireAdmin() Wrapper

```
Stwórz lib/auth-utils.ts:

1. requireAdmin() - redirect jeśli nie admin
2. requireAuth() - redirect jeśli niezalogowany
3. getOptionalSession() - session lub null

Użyj getServerSession z authOptions.
Redirect do /login lub /unauthorized.
```

### 4.3 — Strony Login/Register

```
Stwórz app/(auth)/login/page.tsx i register/page.tsx:

Login:
- Formularz email + password
- Walidacja Zod client-side
- signIn() z next-auth/react
- Redirect do / po sukcesie
- Error handling

Register:
- Formularz email + password + confirm
- Server Action do tworzenia usera
- Hash password bcrypt
- Domyślna rola: USER
- Redirect do /login po sukcesie

Dark theme, centered card layout.
```

### ✅ Checkpoint Fazy 4

```
/review

Sprawdź:
- [ ] Rejestracja tworzy usera w MongoDB
- [ ] Login działa z poprawnymi danymi
- [ ] Session zawiera role
- [ ] requireAdmin() blokuje nie-adminów
- [ ] pnpm lint && pnpm type-check - brak błędów
```

---

## 👑 FAZA 5: Panel Admina (Dzień 7-8)

### 5.1 — Admin Layout

```
Stwórz app/admin/layout.tsx:

- requireAdmin() na początku
- Sidebar z nawigacją:
  - Dashboard
  - Drużyny
  - Mecze
  - Wyniki
  - Ustawienia ligi
- Header z info o zalogowanym userze
- Logout button

Dark theme, responsive (sidebar jako drawer na mobile).
```

### 5.2 — CRUD Drużyny

```
Stwórz app/admin/druzyny/:

page.tsx - lista drużyn z przyciskiem "Dodaj"
nowa/page.tsx - formularz dodawania
[id]/page.tsx - formularz edycji

Server Actions w app/actions/teams.ts:
- createTeam() - Zod validation + revalidateTag('teams')
- updateTeam() - Zod validation + revalidateTag('teams')
- deleteTeam() - sprawdź czy nie ma meczów + revalidateTag('teams')

Formularze:
- name, shortName (3 znaki), slug (auto-generate)
- stadium, city, founded
- colors.primary, colors.secondary (color picker)
- logo URL

useSWR dla real-time listy.
```

### 5.3 — CRUD Mecze

```
Stwórz app/admin/mecze/ analogicznie do drużyn.

Formularz meczu:
- homeTeam, awayTeam (select z drużyn)
- round (1-34)
- season (select)
- date, time
- stadium (domyślnie ze stadion home team)
- status (tylko SCHEDULED przy tworzeniu)

Walidacja: homeTeam !== awayTeam

Server Actions + revalidateTag('matches')
```

### 5.4 — Wprowadzanie wyników

```
Think hard.

Stwórz app/admin/wyniki/page.tsx:

UI:
- Lista meczów SCHEDULED dla currentRound
- Dla każdego meczu: input homeScore, awayScore
- Przycisk "Zapisz wynik"

Server Action updateMatchResult():
1. Zod validation (FINISHED wymaga wyników!)
2. Update Match w MongoDB
3. revalidateTag('standings')
4. revalidateTag('matches')

Transakcja MongoDB dla atomowości.
Real-time update listy po zapisie (useSWR mutate).
```

### 5.5 — Ustawienia ligi (currentRound)

```
Stwórz app/admin/ustawienia/page.tsx:

- Wyświetl currentSeason, currentRound
- Select do zmiany currentRound (1-34)
- Przycisk "Zapisz"

Server Action:
- updateCurrentRound()
- revalidateTag('league')
- revalidateTag('matches') (terminarz zależy od currentRound)

Pokaż statystyki: ile meczów rozegranych, ile pozostało.
```

### ✅ Checkpoint Fazy 5

```
/review

Sprawdź:
- [ ] Admin layout z requireAdmin()
- [ ] CRUD drużyn działa
- [ ] CRUD meczów działa
- [ ] Wprowadzanie wyników aktualizuje tabelę
- [ ] revalidateTag na wszystkich mutacjach
- [ ] pnpm lint && pnpm type-check - brak błędów
```

---

## 🎯 FAZA 6: Polish + Seed + Deploy (Dzień 9-10)

### 6.1 — Seed Data

```
Stwórz scripts/seed.ts:

1. Utwórz League "Ekstraklasa"
2. Utwórz 18 drużyn Ekstraklasy 2024/2025 (prawdziwe dane)
3. Wygeneruj terminarz 34 kolejek (każdy z każdym 2x)
4. Ustaw currentRound na 15 (środek sezonu)
5. Wygeneruj losowe wyniki dla kolejek 1-14

Uruchomienie: pnpm seed (dodaj script do package.json)
```

### 6.2 — Error Pages

```
Stwórz:
- app/error.tsx - globalny error boundary
- app/not-found.tsx - 404
- app/unauthorized/page.tsx - brak uprawnień

Dark theme, przyciski powrotu, spójny design.
```

### 6.3 — Final Review

```
/review

Sprawdź całą aplikację pod kątem:
1. Standing NIE jest kolekcją
2. Head-to-head działa poprawnie
3. currentRound w terminarzu
4. Zod validation wszędzie
5. revalidateTag na wszystkich mutacjach
6. requireAdmin() na admin routes
7. Brak secrets w kodzie

Uruchom: pnpm lint && pnpm type-check && pnpm build

Zgłoś wszystkie znalezione problemy.
```

---

## 📋 PROMPTY POMOCNICZE

### Kontynuacja po przerwie

```
Przeczytaj @docs/session-handoff.md i kontynuuj gdzie skończyliśmy.
```

### Debug problemu

```
Think hard.

Problem: [opis]
Pliki: [ścieżki]

Przeanalizuj kod i znajdź przyczynę. Zaproponuj fix.
```

### Refaktor komponentu

```
Przeczytaj [ścieżka do pliku].

Zrefaktoruj ten komponent:
- [konkretne wymagania]
- Zachowaj istniejącą funkcjonalność
- Popraw czytelność

Output: zrefaktorowany plik
```

### Dodaj testy

```
Stwórz testy dla [plik/funkcja]:

- Unit tests dla core logic
- Edge cases
- Error handling

Użyj Jest + React Testing Library.
Output: __tests__/[nazwa].test.ts
```

### Przed commitem

```
/review
```

### Czyszczenie kontekstu

```
/clear
```

### Zapisz postęp sesji

```
Zapisz aktualny postęp do @docs/session-handoff.md:
- Co zostało ukończone
- Co jest w trakcie
- Następne kroki
- Znane problemy
```

---

## ⚡ QUICK REFERENCE

| Sytuacja | Prompt |
|----------|--------|
| Złożony problem | `Think hard.` na początku |
| Niezwiązane zadanie | `/clear` przed promptem |
| Przed commitem | `/review` |
| Po przerwie | Przeczytaj @docs/session-handoff.md |
| Błąd TypeScript | `pnpm type-check` + fix |
| Błąd lint | `pnpm lint --fix` |

---

*Prompty v1.0 — Ekstraklasa Tracker*
