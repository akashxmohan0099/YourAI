export default function DashboardLoading() {
  return (
    <div className="dashboard-stack animate-pulse">
      <div className="panel rounded-[30px] px-6 py-6 sm:px-8 sm:py-8">
        <div className="space-y-4">
          <div className="h-3 w-24 rounded-full bg-[var(--surface-muted)]" />
          <div className="h-8 w-72 rounded-xl bg-[var(--surface-muted)]" />
          <div className="h-4 w-96 rounded-lg bg-[var(--surface-muted)] opacity-60" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="panel rounded-[28px] px-5 py-5">
            <div className="h-3 w-28 rounded-full bg-[var(--surface-muted)]" />
            <div className="mt-3 h-9 w-12 rounded-lg bg-[var(--surface-muted)]" />
            <div className="mt-2 h-3 w-32 rounded-full bg-[var(--surface-muted)] opacity-60" />
          </div>
        ))}
      </div>
    </div>
  )
}
