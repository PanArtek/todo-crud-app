import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
      <div className="card max-w-md p-8 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--bg-hover)]">
          <span
            className="text-4xl font-bold text-[var(--accent-secondary)]"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            404
          </span>
        </div>

        <h1
          className="text-2xl font-bold text-white"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          Strona nie znaleziona
        </h1>

        <p className="mt-3 text-[var(--text-secondary)]">
          Strona, której szukasz, nie istnieje lub została przeniesiona.
        </p>

        <div className="mt-8">
          <Link
            href="/"
            className="inline-block rounded-lg bg-[var(--accent-primary)] px-6 py-3 font-medium text-white transition-colors hover:bg-[var(--accent-primary)]/90"
          >
            Wróć do strony głównej
          </Link>
        </div>
      </div>
    </div>
  );
}
