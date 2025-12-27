export default function AdminLoading() {
  return (
    <div className="space-y-6">
      {/* Page header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-[var(--bg-hover)]" />
          <div className="h-4 w-64 animate-pulse rounded bg-[var(--bg-hover)]" />
        </div>
        <div className="h-10 w-32 animate-pulse rounded-lg bg-[var(--bg-hover)]" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 animate-pulse rounded-lg bg-[var(--bg-hover)]" />
              <div className="space-y-2">
                <div className="h-4 w-20 animate-pulse rounded bg-[var(--bg-hover)]" />
                <div className="h-6 w-12 animate-pulse rounded bg-[var(--bg-hover)]" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="card overflow-hidden">
        <div className="border-b border-[var(--border-color)] bg-[var(--bg-hover)] px-4 py-3">
          <div className="h-5 w-32 animate-pulse rounded bg-[var(--border-color)]" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between border-b border-[var(--border-color)] px-4 py-4 last:border-b-0"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-[var(--bg-hover)]" />
              <div className="space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-[var(--bg-hover)]" />
                <div className="h-3 w-20 animate-pulse rounded bg-[var(--bg-hover)]" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-16 animate-pulse rounded bg-[var(--bg-hover)]" />
              <div className="h-8 w-16 animate-pulse rounded bg-[var(--bg-hover)]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
