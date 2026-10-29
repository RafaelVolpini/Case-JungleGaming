import { Skeleton } from '@/components/ui/skeleton'

export function MobileNftCardSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="bg-card rounded-[20px] px-1 pt-3 pb-5">
        <Skeleton className="aspect-square w-full rounded-2xl bg-white/[0.04]" />
      </div>
      <div className="mt-[7px] px-2">
        <Skeleton className="h-[22px] w-3/4" />
        <Skeleton className="mt-0.5 h-[17px] w-1/3" />
      </div>
    </div>
  )
}
