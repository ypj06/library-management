export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="加载中">
      <div className="h-9 w-32 animate-pulse rounded-md bg-paper-deep" />
      <div className="h-4 w-80 max-w-full animate-pulse rounded bg-paper-deep" />
      <div className="h-10 w-full animate-pulse rounded-lg bg-paper-deep" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-44 animate-pulse rounded-xl bg-paper-deep"
          />
        ))}
      </div>
    </div>
  );
}
