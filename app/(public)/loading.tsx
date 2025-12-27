export default function PublicLoading() {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-[var(--bg-hover)]" />
        <div className="h-10 w-32 animate-pulse rounded-lg bg-[var(--bg-hover)]" />
      </div>

      {/* Table skeleton */}
      <div className="card overflow-hidden">
        {/* Table header */}
        <div className="flex items-center gap-4 border-b border-[var(--border-color)] bg-[var(--bg-hover)] px-4 py-3">
          <div className="h-4 w-8 animate-pulse rounded bg-[var(--border-color)]" />
          <div className="h-4 w-32 animate-pulse rounded bg-[var(--border-color)]" />
          <div className="ml-auto flex gap-4">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="h-4 w-8 animate-pulse rounded bg-[var(--border-color)]"
              />
            ))}
          </div>
        </div>

        {/* Table rows */}
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-[var(--border-color)] px-4 py-3 last:border-b-0"
          >
            <div className="h-5 w-5 animate-pulse rounded bg-[var(--bg-hover)]" />
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 animate-pulse rounded-full bg-[var(--bg-hover)]" />
              <div className="h-4 w-28 animate-pulse rounded bg-[var(--bg-hover)]" />
            </div>
            <div className="ml-auto flex gap-4">
              {[...Array(7)].map((_, j) => (
                <div
                  key={j}
                  className="h-4 w-8 animate-pulse rounded bg-[var(--bg-hover)]"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
