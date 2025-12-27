/**
 * Match Validation Schemas
 *
 * Walidacja Zod dla meczów.
 * KRYTYCZNE: Status FINISHED wymaga podania wyniku!
 */

import { z } from "zod";
import { MATCH_STATUSES } from "@/models/Match";

/**
 * Statusy meczów jako Zod enum
 */
export const matchStatusSchema = z.enum(MATCH_STATUSES, {
  error: "Nieprawidłowy status meczu. Dozwolone: SCHEDULED, LIVE, FINISHED, POSTPONED, CANCELLED",
});

/**
 * MongoDB ObjectId validation (24 hex characters)
 */
const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Nieprawidłowy format ID");

/**
 * Season format validation (YYYY/YYYY)
 */
const seasonSchema = z
  .string()
  .regex(/^\d{4}\/\d{4}$/, "Sezon musi być w formacie RRRR/RRRR (np. 2024/2025)")
  .refine(
    (val) => {
      const parts = val.split("/");
      const start = Number(parts[0]);
      const end = Number(parts[1]);
      return end === start + 1;
    },
    { message: "Drugi rok sezonu musi być o 1 większy od pierwszego (np. 2024/2025)" }
  );

/**
 * Time format validation (HH:MM)
 */
const timeSchema = z
  .string()
  .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Godzina musi być w formacie HH:MM")
  .optional();

/**
 * Score validation (0-99)
 */
const scoreSchema = z
  .number()
  .int("Wynik musi być liczbą całkowitą")
  .min(0, "Wynik nie może być ujemny")
  .max(99, "Wynik nie może przekraczać 99");

/**
 * Schema do tworzenia nowego meczu
 *
 * Walidacje:
 * - homeTeam !== awayTeam
 * - round: 1-38
 * - date: wymagana
 * - status: domyślnie SCHEDULED
 */
export const createMatchSchema = z
  .object({
    leagueId: objectIdSchema.describe("ID ligi"),
    homeTeam: objectIdSchema.describe("ID drużyny gospodarzy"),
    awayTeam: objectIdSchema.describe("ID drużyny gości"),
    round: z
      .number()
      .int("Kolejka musi być liczbą całkowitą")
      .min(1, "Kolejka musi wynosić minimum 1")
      .max(38, "Kolejka nie może przekraczać 38"),
    season: seasonSchema,
    date: z.coerce.date({
      error: "Nieprawidłowa data meczu",
    }),
    time: timeSchema,
    stadium: z
      .string()
      .max(150, "Nazwa stadionu nie może przekraczać 150 znaków")
      .optional(),
    status: matchStatusSchema.default("SCHEDULED"),
    homeScore: scoreSchema.nullable().default(null),
    awayScore: scoreSchema.nullable().default(null),
  })
  .refine((data) => data.homeTeam !== data.awayTeam, {
    message: "Drużyna gospodarzy i gości nie może być ta sama",
    path: ["awayTeam"],
  })
  .refine(
    (data) => {
      // Jeśli status to FINISHED, wymagane są wyniki
      if (data.status === "FINISHED") {
        return data.homeScore !== null && data.awayScore !== null;
      }
      return true;
    },
    {
      message: "Nie można ustawić statusu FINISHED bez podania wyniku",
      path: ["status"],
    }
  );

/**
 * Schema do aktualizacji meczu (wszystkie pola opcjonalne)
 */
export const updateMatchSchema = z
  .object({
    leagueId: objectIdSchema.optional(),
    homeTeam: objectIdSchema.optional(),
    awayTeam: objectIdSchema.optional(),
    round: z
      .number()
      .int("Kolejka musi być liczbą całkowitą")
      .min(1, "Kolejka musi wynosić minimum 1")
      .max(38, "Kolejka nie może przekraczać 38")
      .optional(),
    season: seasonSchema.optional(),
    date: z.coerce
      .date({
        error: "Nieprawidłowa data meczu",
      })
      .optional(),
    time: timeSchema,
    stadium: z
      .string()
      .max(150, "Nazwa stadionu nie może przekraczać 150 znaków")
      .optional(),
    status: matchStatusSchema.optional(),
    homeScore: scoreSchema.nullable().optional(),
    awayScore: scoreSchema.nullable().optional(),
  })
  .refine(
    (data) => {
      // Jeśli oba są podane, muszą być różne
      if (data.homeTeam && data.awayTeam) {
        return data.homeTeam !== data.awayTeam;
      }
      return true;
    },
    {
      message: "Drużyna gospodarzy i gości nie może być ta sama",
      path: ["awayTeam"],
    }
  );

/**
 * Schema do aktualizacji wyniku meczu
 *
 * 🔴 KRYTYCZNE: Status FINISHED wymaga homeScore i awayScore!
 *
 * @example
 * // Poprawne - zakończenie meczu z wynikiem
 * { homeScore: 2, awayScore: 1, status: 'FINISHED' }
 *
 * // Błędne - FINISHED bez wyniku
 * { status: 'FINISHED' } // ❌ Błąd walidacji
 */
export const updateResultSchema = z
  .object({
    homeScore: scoreSchema.nullable(),
    awayScore: scoreSchema.nullable(),
    status: matchStatusSchema,
  })
  .refine(
    (data) => {
      // 🔴 KRYTYCZNE: Nie można ustawić FINISHED bez wyniku
      if (data.status === "FINISHED") {
        return data.homeScore !== null && data.awayScore !== null;
      }
      return true;
    },
    {
      message: "Nie można zakończyć meczu bez podania wyniku",
      path: ["status"],
    }
  )
  .refine(
    (data) => {
      // Jeśli podano jeden wynik, drugi też musi być podany (lub oba null)
      const homeSet = data.homeScore !== null;
      const awaySet = data.awayScore !== null;
      return homeSet === awaySet;
    },
    {
      message: "Musisz podać wynik dla obu drużyn lub żadnej",
      path: ["homeScore"],
    }
  );

/**
 * Type inference helpers
 */
export type CreateMatchInput = z.infer<typeof createMatchSchema>;
export type UpdateMatchInput = z.infer<typeof updateMatchSchema>;
export type UpdateResultInput = z.infer<typeof updateResultSchema>;
