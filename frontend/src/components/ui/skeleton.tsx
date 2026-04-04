import { cn } from '@/lib/utils'

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-lg bg-[#F0EDE8]', className)}
      style={{ backgroundImage: 'linear-gradient(90deg, #F0EDE8 25%, #E8E3DC 50%, #F0EDE8 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.6s infinite' }}
      {...props}
    />
  )
}

export function DashboardSkeleton() {
  return (
    <div className="h-full overflow-y-auto" style={{ background: '#F9F7F4' }}>
      <div className="mx-auto max-w-[1400px] p-5 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-7 w-52" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border bg-white p-5" style={{ borderColor: '#EDE8E1' }}>
              <div className="flex items-start justify-between mb-4">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-8 w-20 mb-1.5" />
              <Skeleton className="h-4 w-28 mb-1" />
              <Skeleton className="h-3 w-36" />
            </div>
          ))}
        </div>

        {/* Middle row */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border bg-white overflow-hidden" style={{ borderColor: '#EDE8E1' }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #EDE8E1' }}>
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-8 w-8 rounded-xl" />
                <Skeleton className="h-5 w-40" />
              </div>
              <Skeleton className="h-7 w-16 rounded-lg" />
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5" style={{ borderBottom: i < 4 ? '1px solid #F5F2EE' : 'none' }}>
                <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-7 w-10 rounded-lg" />
              </div>
            ))}
          </div>

          <div className="rounded-2xl border bg-white overflow-hidden" style={{ borderColor: '#EDE8E1' }}>
            <div className="flex items-center gap-2.5 px-5 py-4" style={{ borderBottom: '1px solid #EDE8E1' }}>
              <Skeleton className="h-8 w-8 rounded-xl" />
              <Skeleton className="h-5 w-28" />
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3.5" style={{ borderBottom: i < 4 ? '1px solid #F5F2EE' : 'none' }}>
                <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-40" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="rounded-2xl border bg-white overflow-hidden" style={{ borderColor: '#EDE8E1' }}>
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #EDE8E1' }}>
                <div className="flex items-center gap-2.5">
                  <Skeleton className="h-8 w-8 rounded-xl" />
                  <Skeleton className="h-5 w-36" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="p-5 space-y-4">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-9 w-40" />
                <div className="grid grid-cols-2 gap-3">
                  <Skeleton className="h-16 rounded-xl" />
                  <Skeleton className="h-16 rounded-xl" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
