export default function Loading() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-[var(--border-color)] border-t-[var(--accent-primary)]" />
        </div>
        <p className="text-sm text-[var(--text-secondary)]">Ładowanie...</p>
      </div>
    </div>
  );
}
