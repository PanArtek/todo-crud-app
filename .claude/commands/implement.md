# Implement Command

Implementacja zgodnie z planem z `docs/current-plan.md`.

## Workflow

### 1. Załaduj kontekst

```
Przeczytaj: docs/current-plan.md
```

### 2. Implementuj iteracyjnie

Dla każdego pliku z planu:
1. Napisz kod
2. Zweryfikuj TypeScript: `pnpm type-check` (lub tsc --noEmit)
3. Sprawdź lint: `pnpm lint`
4. Jeśli błędy → napraw przed kontynuacją

### 3. Verification po każdym kroku

Po każdej większej zmianie uruchom:
```bash
pnpm lint && pnpm type-check
```

### 4. Post-Implementation Checklist

- [ ] Wszystkie pliki z planu zaimplementowane
- [ ] `pnpm lint` - brak błędów
- [ ] `pnpm type-check` - brak błędów
- [ ] Standing NIE jest kolekcją (jeśli dotyczy)
- [ ] revalidateTag dodane gdzie potrzeba
- [ ] Zod validation na inputach

### 5. Update session handoff

Zapisz postęp do `docs/session-handoff.md`:
```markdown
## [Data] - [Zadanie]

### Zrobione
- ...

### W trakcie
- ...

### Następne kroki
- ...

### Notatki
- ...
```

## Zasady

1. **Nie modyfikuj testów** żeby pasowały do złego kodu - napraw kod
2. **Git sam** - nie pozwól Claude robić git commit/push
3. **Jeden plik na raz** - weryfikuj przed następnym
4. **Escape wcześnie** - jeśli coś idzie źle, zatrzymaj i przemyśl

## Po zakończeniu

Uruchom finalną weryfikację:
```bash
pnpm lint && pnpm type-check && pnpm build
```

Jeśli wszystko OK, poinformuj użytkownika o gotowości do git commit.
