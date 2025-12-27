/**
 * League Validation Schemas
 *
 * Walidacja Zod dla ligi.
 */

import { z } from "zod";

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
    { message: "Drugi rok sezonu musi być o 1 większy od pierwszego" }
  );

/**
 * Schema do aktualizacji aktualnej kolejki
 *
 * 🔴 currentRound: 1-34 (Ekstraklasa)
 */
export const updateCurrentRoundSchema = z.object({
  currentRound: z
    .number()
    .int("Kolejka musi być liczbą całkowitą")
    .min(1, "Kolejka musi wynosić minimum 1")
    .max(34, "Kolejka nie może przekraczać 34 (Ekstraklasa ma 34 kolejki)"),
});

/**
 * Schema do tworzenia nowej ligi
 */
export const createLeagueSchema = z.object({
  name: z
    .string()
    .min(2, "Nazwa ligi musi mieć minimum 2 znaki")
    .max(100, "Nazwa ligi nie może przekraczać 100 znaków")
    .trim(),
  country: z
    .string()
    .min(2, "Kod kraju musi mieć minimum 2 znaki")
    .max(3, "Kod kraju nie może przekraczać 3 znaków")
    .transform((val) => val.toUpperCase()),
  logo: z
    .string()
    .url("Logo musi być prawidłowym URL")
    .optional()
    .or(z.literal("")),
  currentSeason: seasonSchema,
  currentRound: z
    .number()
    .int("Kolejka musi być liczbą całkowitą")
    .min(1, "Kolejka musi wynosić minimum 1")
    .max(38, "Kolejka nie może przekraczać 38")
    .default(1),
  totalRounds: z
    .number()
    .int("Liczba kolejek musi być liczbą całkowitą")
    .min(1, "Liga musi mieć minimum 1 kolejkę")
    .max(38, "Liga nie może mieć więcej niż 38 kolejek")
    .default(34),
  teamsCount: z
    .number()
    .int("Liczba drużyn musi być liczbą całkowitą")
    .min(2, "Liga musi mieć minimum 2 drużyny")
    .max(24, "Liga nie może mieć więcej niż 24 drużyny")
    .default(18),
});

/**
 * Schema do aktualizacji ligi (wszystkie pola opcjonalne)
 */
export const updateLeagueSchema = z.object({
  name: z
    .string()
    .min(2, "Nazwa ligi musi mieć minimum 2 znaki")
    .max(100, "Nazwa ligi nie może przekraczać 100 znaków")
    .trim()
    .optional(),
  country: z
    .string()
    .min(2, "Kod kraju musi mieć minimum 2 znaki")
    .max(3, "Kod kraju nie może przekraczać 3 znaków")
    .transform((val) => val.toUpperCase())
    .optional(),
  logo: z
    .string()
    .url("Logo musi być prawidłowym URL")
    .optional()
    .or(z.literal("")),
  currentSeason: seasonSchema.optional(),
  currentRound: z
    .number()
    .int("Kolejka musi być liczbą całkowitą")
    .min(1, "Kolejka musi wynosić minimum 1")
    .max(38, "Kolejka nie może przekraczać 38")
    .optional(),
  totalRounds: z
    .number()
    .int("Liczba kolejek musi być liczbą całkowitą")
    .min(1, "Liga musi mieć minimum 1 kolejkę")
    .max(38, "Liga nie może mieć więcej niż 38 kolejek")
    .optional(),
  teamsCount: z
    .number()
    .int("Liczba drużyn musi być liczbą całkowitą")
    .min(2, "Liga musi mieć minimum 2 drużyny")
    .max(24, "Liga nie może mieć więcej niż 24 drużyny")
    .optional(),
});

/**
 * Type inference helpers
 */
export type UpdateCurrentRoundInput = z.infer<typeof updateCurrentRoundSchema>;
export type CreateLeagueInput = z.infer<typeof createLeagueSchema>;
export type UpdateLeagueInput = z.infer<typeof updateLeagueSchema>;
