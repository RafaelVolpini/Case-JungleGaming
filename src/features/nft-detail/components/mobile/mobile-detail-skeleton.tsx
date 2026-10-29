import { BackButton } from '@/components/shared/back-button'
import { Skeleton } from '@/components/ui/skeleton'

export function MobileDetailSkeleton() {
  return (
    <div className="bg-card min-h-dvh pb-[190px]" aria-busy="true" aria-label="Carregando NFT">
      <div className="flex items-center justify-between px-7 pt-[23px]">
        <BackButton />
        <Skeleton className="size-[35px] rounded-full" />
      </div>
      <Skeleton className="mt-2 mr-[25px] ml-7 aspect-[361/326] rounded-t-[30px]" />
      <section className="bg-card relative -mt-[2px] rounded-t-[32px] px-6 pt-[33px] pb-8">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-7 w-20 rounded-full" />
        </div>
        <Skeleton className="mt-3 h-6 w-full" />
        <Skeleton className="mt-1 h-6 w-4/5" />
        <Skeleton className="mt-[9px] h-6 w-20" />
        <div className="mt-1 flex gap-2">
          <Skeleton className="h-[25px] w-14 rounded-full" />
          <Skeleton className="h-[25px] w-14 rounded-full" />
          <Skeleton className="h-[25px] w-14 rounded-full" />
        </div>
        <div className="mt-3 flex flex-col gap-2">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-6 w-3/4" />
        </div>
      </section>
      <div className="bg-card fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[640px] rounded-t-[28px] px-6 pt-5 pb-[34px] shadow-[0_-10px_24px_rgba(0,0,0,0.3)]">
        <div className="flex h-[30px] items-center justify-between">
          <Skeleton className="h-[29px] w-32" />
          <Skeleton className="h-7 w-24" />
        </div>
        <div className="mt-5 flex items-center gap-3">
          <Skeleton className="h-[60px] w-[196px] rounded-full" />
          <Skeleton className="size-[60px] rounded-full" />
        </div>
      </div>
    </div>
  )
}
