import { Skeleton } from '@/components/ui/skeleton'

export function NftCardSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="bg-card px-1 py-[25px] max-md:rounded-2xl max-md:p-1">
        <Skeleton className="aspect-square w-full rounded-[14px] bg-white/[0.04]" />
      </div>
      <div className="mt-2.5 max-md:px-2">
        <Skeleton className="h-[22px] w-3/4" />
        <Skeleton className="mt-1.5 h-6 w-1/3" />
      </div>
    </div>
  )
}
