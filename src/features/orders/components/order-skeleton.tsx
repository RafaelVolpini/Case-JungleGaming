import { Skeleton } from '@/components/ui/skeleton'

export function OrderSkeleton() {
  return (
    <div aria-busy="true" className="flex flex-col items-center px-4 pt-6 pb-12 md:px-11">
      <Skeleton className="h-[82px] w-[66px]" />
      <Skeleton className="mt-4 h-6 w-72 max-w-full" />
      <Skeleton className="mt-8 h-[66px] w-full" />
      <Skeleton className="mt-6 h-[70px] w-full" />
      <Skeleton className="mt-3 h-[70px] w-full" />
      <Skeleton className="mt-3 h-[70px] w-full" />
      <Skeleton className="mt-6 h-12 w-[186px]" />
    </div>
  )
}
