import { Skeleton } from '@/components/ui/skeleton'

export function FormSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div aria-busy="true" className="grid gap-x-7 gap-y-[25px] md:grid-cols-2">
      {Array.from({ length: rows * 2 }, (_, index) => (
        <div key={index}>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-3.5 h-10 w-full" />
        </div>
      ))}
    </div>
  )
}
