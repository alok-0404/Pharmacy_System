import { cn } from '../../lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton-shimmer rounded-lg', className)} aria-hidden="true" />;
}

export function SkeletonKpiGrid({ count = 5 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="flex items-start justify-between">
            <Skeleton className="h-11 w-11 rounded-xl" />
            <Skeleton className="h-5 w-12 rounded-full" />
          </div>
          <Skeleton className="mt-5 h-8 w-20" />
          <Skeleton className="mt-2 h-4 w-28" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonComparisonRow({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-3 h-7 w-16" />
          <Skeleton className="mt-2 h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonChartBlock({ height = 'h-64' }: { height?: string }) {
  return (
    <div className={cn('rounded-xl border border-zinc-800 bg-zinc-950/50 p-4', height)}>
      <Skeleton className="mb-3 h-4 w-32" />
      <Skeleton className="h-[calc(100%-2rem)] w-full rounded-lg" />
    </div>
  );
}

export function SkeletonRevenueSection() {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-2 h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-48 rounded-xl" />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonChartBlock key={i} />
        ))}
      </div>
    </section>
  );
}

export function SkeletonDashboardOverview() {
  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="border-b border-zinc-800/80 px-0 py-2">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="mt-2 h-8 w-64" />
        <Skeleton className="mt-2 h-4 w-48" />
      </div>
      <SkeletonKpiGrid />
      <SkeletonComparisonRow />
      <SkeletonRevenueSection />
      <div className="grid gap-6 xl:grid-cols-3">
        <Skeleton className="h-72 rounded-2xl xl:col-span-2" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  );
}

export function SkeletonConversationList({ rows = 7 }: { rows?: number }) {
  return (
    <div className="divide-y divide-zinc-800">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 px-4 py-3">
          <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex justify-between gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-14 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonChatPanel() {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#e5ddd5]">
      <div className="flex shrink-0 items-center gap-3 border-b border-violet-900/50 bg-violet-800/80 px-5 py-4">
        <Skeleton className="h-10 w-10 rounded-full bg-violet-900/40" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 bg-violet-900/40" />
          <Skeleton className="h-3 w-24 bg-violet-900/30" />
        </div>
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-hidden px-4 py-4">
        <div className="flex justify-start">
          <Skeleton className="h-14 w-[58%] rounded-2xl rounded-tl-sm bg-white/70" />
        </div>
        <div className="flex justify-end">
          <Skeleton className="h-10 w-[45%] rounded-2xl rounded-tr-sm bg-violet-200/60" />
        </div>
        <div className="flex justify-start">
          <Skeleton className="h-20 w-[65%] rounded-2xl rounded-tl-sm bg-white/70" />
        </div>
        <div className="flex justify-end">
          <Skeleton className="h-12 w-[50%] rounded-2xl rounded-tr-sm bg-violet-200/60" />
        </div>
        <div className="flex justify-start">
          <Skeleton className="h-10 w-[40%] rounded-2xl rounded-tl-sm bg-white/70" />
        </div>
      </div>
      <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-3">
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonOrderList({ rows = 8 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b border-zinc-800 px-4 py-4">
          <div className="flex justify-between gap-2">
            <Skeleton className="h-4 w-28" />
            {i < 2 ? <Skeleton className="h-4 w-10 rounded-full" /> : null}
          </div>
          <Skeleton className="mt-2 h-3 w-16" />
          <Skeleton className="mt-1 h-3 w-32" />
          <Skeleton className="mt-1 h-3 w-24" />
          <Skeleton className="mt-2 h-5 w-28 rounded-full" />
        </div>
      ))}
    </>
  );
}

export function SkeletonOrderDetail() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Skeleton className="h-7 w-40" />
        <Skeleton className="mt-2 h-4 w-56" />
        <Skeleton className="mt-2 h-3 w-44" />
      </div>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-2 h-6 w-36" />
        <Skeleton className="mt-4 h-48 w-full rounded-xl" />
        <div className="mt-6 space-y-3">
          <Skeleton className="h-4 w-28" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
        <div className="mt-6 flex gap-2">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonMedicineList({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3"
        >
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-52" />
          </div>
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonPatientList({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-3"
        >
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 bg-slate-200" />
            <Skeleton className="h-3 w-24 bg-slate-100" />
          </div>
          <Skeleton className="h-8 w-20 rounded-lg bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonFaqList({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
          <Skeleton className="h-4 w-3/4 max-w-xs" />
          <Skeleton className="mt-2 h-3 w-full" />
          <Skeleton className="mt-1 h-3 w-5/6" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-xl border border-zinc-800">
      <div className="flex gap-4 border-b border-zinc-800 bg-zinc-900 px-4 py-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="flex gap-4 border-b border-zinc-800 px-4 py-3 last:border-0">
          {Array.from({ length: cols }).map((_, col) => (
            <Skeleton key={col} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
