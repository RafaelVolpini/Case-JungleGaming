import { Skeleton } from '@/components/ui/skeleton'

export function MobileCartSkeleton() {
  return (
    <>
      <div aria-busy="true" aria-label="Carregando carrinho" className="flex flex-col gap-5">
        <Skeleton className="h-[100px] rounded-[20px]" />
        <Skeleton className="h-[100px] rounded-[20px]" />
      </div>
      <div
        aria-hidden="true"
        className="bg-card fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[640px] rounded-t-[36px] px-6 pt-6 pb-9 shadow-[0_-10px_24px_rgba(0,0,0,0.35)]"
      >
        <Skeleton className="h-[45px] w-full rounded-full" />
        <div className="mt-[9px] flex flex-col gap-[8.5px]">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </div>
        <Skeleton className="mt-[10px] h-6 w-full" />
        <Skeleton className="mt-6 h-[60px] w-full rounded-full" />
      </div>
    </>
  )
}
