# Plan Command

Przed rozpoczęciem kodowania, wykonaj fazę EXPLORE → PLAN:

## 1. EXPLORE (zrozumienie)

Przeczytaj i zrozum:
- [ ] @docs/PRD.md - wymagania projektu
- [ ] @docs/architecture.md - decyzje architektoniczne
- [ ] Istniejący kod w relevantnych plikach

## 2. PLAN (przemyśl)

Użyj extended thinking: **"think hard"** dla złożonych problemów.

Odpowiedz na pytania:
1. Jakie pliki trzeba utworzyć/zmodyfikować?
2. Jakie zależności są potrzebne?
3. Czy to wpływa na Standing? (pamiętaj: projekcja, nie kolekcja!)
4. Czy potrzebuję revalidateTag?
5. Jakie są edge cases?

## 3. OUTPUT

Zapisz plan do `docs/current-plan.md`:

```markdown
# Plan: [nazwa zadania]

## Cel
[1-2 zdania]

## Pliki do modyfikacji
- [ ] plik1.ts - opis zmian
- [ ] plik2.ts - opis zmian

## Nowe pliki
- [ ] nowy-plik.ts - cel

## Zależności
- [ ] package1 - powód

## Checklist przed implementacją
- [ ] Standing to projekcja (nie kolekcja)
- [ ] Zod validation gotowa
- [ ] revalidateTag zaplanowane

## Ryzyko
- ...
```

## 4. CONFIRM

Pokaż plan użytkownikowi i poczekaj na akceptację przed kodowaniem.

---

Po akceptacji użyj `/implement` do rozpoczęcia kodowania.
