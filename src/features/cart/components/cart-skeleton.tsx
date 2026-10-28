import { Skeleton } from '@/components/ui/skeleton'

export function CartSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Carregando carrinho"
      className="md:grid md:grid-cols-[782px_1fr] md:gap-x-[86px]"
    >
      <div>
        <Skeleton className="h-6 w-full" />
        <div className="mt-3 flex flex-col gap-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-[70px] w-full" />
          ))}
        </div>
      </div>
      <div className="mt-8 md:mt-0">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="mt-7 h-[70px] w-full" />
        <Skeleton className="mt-6 h-24 w-full" />
        <Skeleton className="mt-6 h-14 w-full" />
      </div>
    </div>
  )
}
