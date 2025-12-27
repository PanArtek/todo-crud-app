/**
 * Team Validation Schemas
 *
 * Walidacja Zod dla drużyn.
 */

import { z } from "zod";

/**
 * MongoDB ObjectId validation (24 hex characters)
 */
const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Nieprawidłowy format ID");

/**
 * Slug validation (lowercase, numbers, hyphens)
 */
const slugSchema = z
  .string()
  .min(2, "Slug musi mieć minimum 2 znaki")
  .max(100, "Slug nie może przekraczać 100 znaków")
  .regex(
    /^[a-z0-9-]+$/,
    "Slug może zawierać tylko małe litery, cyfry i myślniki"
  )
  .transform((val) => val.toLowerCase());

/**
 * Hex color validation (#RRGGBB)
 */
const hexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Kolor musi być w formacie hex (np. #FF0000)")
  .optional();

/**
 * Team colors schema
 */
const teamColorsSchema = z
  .object({
    primary: hexColorSchema,
    secondary: hexColorSchema,
  })
  .optional();

/**
 * Schema do tworzenia nowej drużyny
 */
export const createTeamSchema = z.object({
  leagueId: objectIdSchema.describe("ID ligi"),
  name: z
    .string()
    .min(2, "Nazwa drużyny musi mieć minimum 2 znaki")
    .max(100, "Nazwa drużyny nie może przekraczać 100 znaków")
    .trim(),
  shortName: z
    .string()
    .min(2, "Skrót nazwy musi mieć minimum 2 znaki")
    .max(4, "Skrót nazwy nie może przekraczać 4 znaków")
    .transform((val) => val.toUpperCase())
    .describe("Skrót nazwy drużyny (np. LEP, LEG)"),
  slug: slugSchema.describe("URL-friendly nazwa (np. lech-poznan)"),
  logo: z
    .string()
    .url("Logo musi być prawidłowym URL")
    .optional()
    .or(z.literal("")),
  stadium: z
    .string()
    .max(150, "Nazwa stadionu nie może przekraczać 150 znaków")
    .optional(),
  city: z
    .string()
    .max(100, "Nazwa miasta nie może przekraczać 100 znaków")
    .optional(),
  founded: z
    .number()
    .int("Rok założenia musi być liczbą całkowitą")
    .min(1800, "Rok założenia musi być po 1800")
    .max(new Date().getFullYear(), "Rok założenia nie może być w przyszłości")
    .optional(),
  colors: teamColorsSchema,
});

/**
 * Schema do aktualizacji drużyny (wszystkie pola opcjonalne)
 */
export const updateTeamSchema = z.object({
  leagueId: objectIdSchema.optional(),
  name: z
    .string()
    .min(2, "Nazwa drużyny musi mieć minimum 2 znaki")
    .max(100, "Nazwa drużyny nie może przekraczać 100 znaków")
    .trim()
    .optional(),
  shortName: z
    .string()
    .min(2, "Skrót nazwy musi mieć minimum 2 znaki")
    .max(4, "Skrót nazwy nie może przekraczać 4 znaków")
    .transform((val) => val.toUpperCase())
    .optional(),
  slug: slugSchema.optional(),
  logo: z
    .string()
    .url("Logo musi być prawidłowym URL")
    .optional()
    .or(z.literal("")),
  stadium: z
    .string()
    .max(150, "Nazwa stadionu nie może przekraczać 150 znaków")
    .optional(),
  city: z
    .string()
    .max(100, "Nazwa miasta nie może przekraczać 100 znaków")
    .optional(),
  founded: z
    .number()
    .int("Rok założenia musi być liczbą całkowitą")
    .min(1800, "Rok założenia musi być po 1800")
    .max(new Date().getFullYear(), "Rok założenia nie może być w przyszłości")
    .optional(),
  colors: teamColorsSchema,
});

/**
 * Type inference helpers
 */
export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
