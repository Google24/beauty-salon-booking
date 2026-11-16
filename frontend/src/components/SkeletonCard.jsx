function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl bg-[var(--color-white)] p-6 ring-1 ring-[var(--color-sand)]/70">
      <div className="h-6 w-3/4 rounded bg-[var(--color-sand)]" />
      <div className="mt-6 h-8 w-1/2 rounded bg-[var(--color-sand)]" />
      <div className="mt-4 h-4 w-2/3 rounded bg-[var(--color-sand)]" />
    </div>
  )
}

export default SkeletonCard