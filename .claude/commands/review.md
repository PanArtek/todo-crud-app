# Review Command

Przegląd kodu przed commitem.

## Checklist

### 1. Standing jako projekcja

- [ ] NIE ma modelu `models/Standing.ts`
- [ ] NIE ma kolekcji `standings` w MongoDB
- [ ] Tabela wyliczana przez `calculateStandings()`

### 2. Zod validation

- [ ] Wszystkie inputy walidowane przez Zod
- [ ] `FINISHED` wymaga `homeScore` i `awayScore`
- [ ] `homeTeam !== awayTeam` w tworzeniu meczu

### 3. Auth

- [ ] Admin routes używają `requireAdmin()`
- [ ] API routes sprawdzają session
- [ ] Brak hardcoded credentials

### 4. Cache

- [ ] `revalidateTag('standings')` po zapisie wyniku
- [ ] `revalidateTag('matches')` po CRUD meczu
- [ ] `revalidateTag('teams')` po CRUD drużyny

### 5. TypeScript

```bash
pnpm type-check
```
- [ ] Brak błędów typu
- [ ] Brak `any` (chyba że uzasadnione)

### 6. Lint

```bash
pnpm lint
```
- [ ] Brak błędów ESLint
- [ ] Brak warningów (lub uzasadnione)

### 7. Security

- [ ] Brak `.env` w repo
- [ ] Brak secrets w kodzie
- [ ] Brak `dangerouslySetInnerHTML` bez sanityzacji

### 8. UX

- [ ] Terminarz domyślnie pokazuje `currentRound`
- [ ] Dark theme applied
- [ ] Responsywność (mobile-first)

## Uruchom review

```bash
# Wszystkie checky naraz
pnpm lint && pnpm type-check && pnpm build
```

## Po pozytywnym review

Powiadom użytkownika, że kod jest gotowy do:
```bash
git add .
git commit -m "feat: [opis]"
```
