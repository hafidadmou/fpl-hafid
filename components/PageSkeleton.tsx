export default function PageSkeleton({ cards = 9 }: { cards?: number }) {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <div className="mb-6 h-8 w-56 animate-pulse rounded-full bg-slate-800" />
      <div className="mb-6 h-14 animate-pulse rounded-2xl bg-slate-900/70" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: cards }).map((_, index) => (
          <div key={index} className="animate-pulse rounded-[1.3rem] border border-white/10 bg-slate-900/70 p-4">
            <div className="mb-3 h-5 w-2/3 rounded-full bg-slate-700" />
            <div className="mb-2 h-4 w-1/2 rounded-full bg-slate-700" />
            <div className="h-4 w-full rounded-full bg-slate-700" />
          </div>
        ))}
      </div>
    </div>
  );
}
