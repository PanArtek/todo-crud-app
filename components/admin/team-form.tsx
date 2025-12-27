"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTeam, updateTeam } from "@/app/actions/teams";

interface TeamData {
  _id?: string;
  name?: string;
  shortName?: string;
  slug?: string;
  stadium?: string;
  city?: string;
  founded?: number;
  logo?: string;
  colors?: {
    primary?: string;
    secondary?: string;
  };
}

interface TeamFormProps {
  team?: TeamData;
  isEdit?: boolean;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function TeamForm({ team, isEdit = false }: TeamFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slug, setSlug] = useState(team?.slug || "");

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEdit && !slug) {
      setSlug(generateSlug(e.target.value));
    }
  };

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setError(null);

    const result = isEdit && team?._id
      ? await updateTeam(team._id, formData)
      : await createTeam(formData);

    if (result.success) {
      router.push("/admin/druzyny");
      router.refresh();
    } else {
      setError(result.error || "Wystapil blad");
      setIsSubmitting(false);
    }
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-[var(--status-loss)]/20 p-4 text-sm text-[var(--status-loss)]">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Name */}
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
            Nazwa druzyny *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            defaultValue={team?.name}
            onChange={handleNameChange}
            required
            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2.5 text-white placeholder-[var(--text-muted)] focus:border-[var(--accent-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-secondary)]"
            placeholder="np. Lech Poznan"
          />
        </div>

        {/* Short Name */}
        <div>
          <label htmlFor="shortName" className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
            Skrot nazwy (2-4 znaki) *
          </label>
          <input
            type="text"
            id="shortName"
            name="shortName"
            defaultValue={team?.shortName}
            required
            maxLength={4}
            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2.5 text-white uppercase placeholder-[var(--text-muted)] focus:border-[var(--accent-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-secondary)]"
            placeholder="np. LEP"
          />
        </div>

        {/* Slug */}
        <div>
          <label htmlFor="slug" className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
            Slug (URL) *
          </label>
          <input
            type="text"
            id="slug"
            name="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
            required
            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2.5 text-white placeholder-[var(--text-muted)] focus:border-[var(--accent-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-secondary)]"
            placeholder="np. lech-poznan"
          />
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Bedzie uzywany w URL: /druzyna/{slug || "slug"}
          </p>
        </div>

        {/* City */}
        <div>
          <label htmlFor="city" className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
            Miasto
          </label>
          <input
            type="text"
            id="city"
            name="city"
            defaultValue={team?.city}
            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2.5 text-white placeholder-[var(--text-muted)] focus:border-[var(--accent-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-secondary)]"
            placeholder="np. Poznan"
          />
        </div>

        {/* Stadium */}
        <div>
          <label htmlFor="stadium" className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
            Stadion
          </label>
          <input
            type="text"
            id="stadium"
            name="stadium"
            defaultValue={team?.stadium}
            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2.5 text-white placeholder-[var(--text-muted)] focus:border-[var(--accent-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-secondary)]"
            placeholder="np. Stadion Miejski"
          />
        </div>

        {/* Founded */}
        <div>
          <label htmlFor="founded" className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
            Rok zalozenia
          </label>
          <input
            type="number"
            id="founded"
            name="founded"
            defaultValue={team?.founded}
            min={1800}
            max={new Date().getFullYear()}
            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2.5 text-white placeholder-[var(--text-muted)] focus:border-[var(--accent-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-secondary)]"
            placeholder="np. 1922"
          />
        </div>

        {/* Logo URL */}
        <div className="md:col-span-2">
          <label htmlFor="logo" className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
            URL logo
          </label>
          <input
            type="url"
            id="logo"
            name="logo"
            defaultValue={team?.logo}
            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2.5 text-white placeholder-[var(--text-muted)] focus:border-[var(--accent-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-secondary)]"
            placeholder="https://example.com/logo.png"
          />
        </div>

        {/* Colors */}
        <div>
          <label htmlFor="colors.primary" className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
            Kolor glowny
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              id="colors.primary"
              name="colors.primary"
              defaultValue={team?.colors?.primary || "#000000"}
              className="h-10 w-14 cursor-pointer rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]"
            />
            <input
              type="text"
              defaultValue={team?.colors?.primary}
              placeholder="#000000"
              className="flex-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2.5 text-white placeholder-[var(--text-muted)] focus:border-[var(--accent-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-secondary)]"
              onChange={(e) => {
                const input = document.getElementById("colors.primary") as HTMLInputElement;
                if (input && /^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                  input.value = e.target.value;
                }
              }}
            />
          </div>
        </div>

        <div>
          <label htmlFor="colors.secondary" className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
            Kolor dodatkowy
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              id="colors.secondary"
              name="colors.secondary"
              defaultValue={team?.colors?.secondary || "#FFFFFF"}
              className="h-10 w-14 cursor-pointer rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]"
            />
            <input
              type="text"
              defaultValue={team?.colors?.secondary}
              placeholder="#FFFFFF"
              className="flex-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2.5 text-white placeholder-[var(--text-muted)] focus:border-[var(--accent-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-secondary)]"
              onChange={(e) => {
                const input = document.getElementById("colors.secondary") as HTMLInputElement;
                if (input && /^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                  input.value = e.target.value;
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 border-t border-[var(--border-color)] pt-6 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="rounded-lg bg-[var(--bg-hover)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--bg-hover)]/80 disabled:opacity-50"
        >
          Anuluj
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-[var(--accent-primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-primary)]/80 disabled:opacity-50"
        >
          {isSubmitting ? "Zapisywanie..." : isEdit ? "Zapisz zmiany" : "Dodaj druzyne"}
        </button>
      </div>
    </form>
  );
}
