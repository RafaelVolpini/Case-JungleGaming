import { Skeleton } from '@/components/ui/skeleton'

export function NftDetailSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Carregando NFT"
      className="md:grid md:grid-cols-[572px_1fr] md:gap-x-[33px]"
    >
      <div className="flex gap-7">
        <div className="hidden flex-col gap-4 md:flex">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="size-[100px] rounded-xl" />
          ))}
        </div>
        <Skeleton className="aspect-square w-full rounded-lg md:size-[444px]" />
      </div>
      <div className="mt-6 md:mt-0">
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="mt-3 h-7 w-1/3" />
        <Skeleton className="mt-6 h-5 w-32" />
        <Skeleton className="mt-3 h-[72px] w-full" />
        <Skeleton className="mt-5 h-7 w-56" />
        <Skeleton className="mt-6 h-[47px] w-full" />
        <Skeleton className="mt-6 h-24 w-2/3" />
      </div>
    </div>
  )
}
