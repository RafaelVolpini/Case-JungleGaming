import { Skeleton } from '@/components/ui/skeleton'

export function CheckoutSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Carregando pagamento"
      className="md:grid md:grid-cols-[762px_minmax(0,1fr)] md:gap-x-[33px]"
    >
      <div className="grid gap-x-[25px] gap-y-4 md:grid-cols-2">
        {Array.from({ length: 10 }, (_, index) => (
          <Skeleton key={index} className="h-16 w-full" />
        ))}
      </div>
      <div className="mt-8 md:mt-0">
        <Skeleton className="h-[70px] w-full" />
        <Skeleton className="mt-3 h-[70px] w-full" />
        <Skeleton className="mt-6 h-32 w-full" />
        <Skeleton className="mt-6 h-11 w-full" />
      </div>
    </div>
  )
}
