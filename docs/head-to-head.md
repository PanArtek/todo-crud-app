# Algorytm Head-to-Head (Ekstraklasa)

## Zasady PZPN

Przy równej liczbie punktów, kolejność drużyn ustala się według:

1. **Punkty w meczach bezpośrednich** między drużynami z tą samą liczbą punktów
2. **Różnica bramek w meczach bezpośrednich**
3. **Bramki strzelone w meczach bezpośrednich**
4. **Różnica bramek ogółem** (wszystkie mecze sezonu)
5. **Bramki strzelone ogółem**

## Przykład

### Sytuacja
Po 20 kolejkach trzy drużyny mają po 35 punktów:
- Lech Poznań
- Legia Warszawa  
- Raków Częstochowa

### Mecze bezpośrednie (mini-tabela)

| Mecz | Wynik |
|------|-------|
| Lech - Legia | 2:1 |
| Legia - Raków | 1:1 |
| Raków - Lech | 0:2 |
| Legia - Lech | 0:0 |
| Raków - Legia | 2:0 |
| Lech - Raków | 1:1 |

### Kalkulacja mini-tabeli

**Lech Poznań:**
- vs Legia: W (3 pkt), D (1 pkt) = 4 pkt, bramki: 2-1, 0-0 → 2:1
- vs Raków: W (3 pkt), D (1 pkt) = 4 pkt, bramki: 2-0, 1-1 → 3:1
- **Razem:** 8 pkt, +3 (5:2)

**Legia Warszawa:**
- vs Lech: L (0 pkt), D (1 pkt) = 1 pkt, bramki: 1-2, 0-0 → 1:2
- vs Raków: D (1 pkt), L (0 pkt) = 1 pkt, bramki: 1-1, 0-2 → 1:3
- **Razem:** 2 pkt, -3 (2:5)

**Raków Częstochowa:**
- vs Lech: L (0 pkt), D (1 pkt) = 1 pkt, bramki: 0-2, 1-1 → 1:3
- vs Legia: D (1 pkt), W (3 pkt) = 4 pkt, bramki: 1-1, 2-0 → 3:1
- **Razem:** 5 pkt, 0 (4:4)

### Wynik sortowania

1. **Lech Poznań** (8 pkt h2h)
2. **Raków Częstochowa** (5 pkt h2h)
3. **Legia Warszawa** (2 pkt h2h)

## Implementacja

```typescript
function sortGroupByHeadToHead(
  teams: TeamStats[],
  allMatches: Match[]
): TeamStats[] {
  const teamIds = new Set(teams.map(t => t.teamId));
  
  // 1. Filtruj mecze bezpośrednie
  const h2hMatches = allMatches.filter(m => 
    teamIds.has(m.homeTeam.toString()) && 
    teamIds.has(m.awayTeam.toString())
  );

  // 2. Oblicz mini-tabelę
  const h2hStats = new Map<string, H2HStats>();
  
  for (const team of teams) {
    h2hStats.set(team.teamId, { 
      points: 0, 
      goalDiff: 0, 
      goalsFor: 0 
    });
  }

  for (const match of h2hMatches) {
    // ... obliczenia jak w SKILL.md
  }

  // 3. Sortuj według zasad
  return teams.sort((a, b) => {
    const aH2H = h2hStats.get(a.teamId)!;
    const bH2H = h2hStats.get(b.teamId)!;

    // Krok 1: Punkty h2h
    if (bH2H.points !== aH2H.points) {
      return bH2H.points - aH2H.points;
    }
    
    // Krok 2: Różnica bramek h2h
    if (bH2H.goalDiff !== aH2H.goalDiff) {
      return bH2H.goalDiff - aH2H.goalDiff;
    }
    
    // Krok 3: Bramki strzelone h2h
    if (bH2H.goalsFor !== aH2H.goalsFor) {
      return bH2H.goalsFor - aH2H.goalsFor;
    }
    
    // Krok 4: Różnica bramek ogółem
    const aGD = a.goalsFor - a.goalsAgainst;
    const bGD = b.goalsFor - b.goalsAgainst;
    if (bGD !== aGD) {
      return bGD - aGD;
    }
    
    // Krok 5: Bramki strzelone ogółem
    return b.goalsFor - a.goalsFor;
  });
}
```

## Edge Cases

### 1. Więcej niż 2 drużyny z równymi punktami

Gdy 3+ drużyny mają tyle samo punktów, obliczamy mini-tabelę TYLKO z meczów między tymi drużynami.

**Przykład:** Jeśli A, B, C mają po 30 pkt:
- Bierzemy tylko mecze: A-B, B-A, A-C, C-A, B-C, C-B
- NIE bierzemy meczów z innymi drużynami

### 2. Niekompletne mecze h2h

Jeśli nie wszystkie mecze bezpośrednie zostały rozegrane:
- Obliczamy z dostępnych meczów
- Pod koniec sezonu wszystkie mecze będą rozegrane

### 3. Identyczna mini-tabela

Jeśli po h2h nadal jest remis → przechodzimy do ogólnej różnicy bramek.

### 4. Początek sezonu

Gdy brak meczów bezpośrednich → od razu różnica bramek ogółem.

## Testy

```typescript
describe('head-to-head sorting', () => {
  it('should sort by h2h points first', () => {
    // A ma 3 pkt h2h (wygrał z B)
    // B ma 0 pkt h2h (przegrał z A)
    // Obaj mają 30 pkt ogółem
    // Wynik: [A, B]
  });

  it('should fall back to h2h goal difference', () => {
    // A i B mają po 1 pkt h2h (remis 1:1 i 2:2)
    // A: +0 (3:3), B: +0 (3:3)
    // → bramki strzelone h2h: A=3, B=3
    // → różnica bramek ogółem
  });

  it('should handle 3+ teams correctly', () => {
    // Oblicz mini-tabelę tylko z meczów między A, B, C
  });
});
```
