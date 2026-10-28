import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

import { useCatalogFilters } from '../../hooks/use-catalog-filters'
import { CollectionFilter } from '../sidebar/collection-filter'
import { NetworkFilter } from '../sidebar/network-filter'
import { PriceFilter } from '../sidebar/price-filter'

type MobileFilterSheetProps = { open: boolean; onOpenChange: (open: boolean) => void }

export function MobileFilterSheet({ open, onOpenChange }: MobileFilterSheetProps) {
  const { reset } = useCatalogFilters()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85dvh] gap-0 rounded-t-3xl">
        <SheetHeader className="px-6 pt-6">
          <SheetTitle className="text-cream text-lg font-bold">Filtros</SheetTitle>
          <SheetDescription className="sr-only">
            Filtre o catálogo por coleção, faixa de preço e rede.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          <CollectionFilter />
          <div className="mt-8">
            <PriceFilter />
          </div>
          <div className="mt-8">
            <NetworkFilter />
          </div>
        </div>
        <SheetFooter className="flex-row gap-3 px-6 pb-6">
          <Button variant="outline" className="h-12 flex-1 rounded-xl" onClick={reset}>
            Limpar
          </Button>
          <SheetClose asChild>
            <Button className="h-12 flex-1 rounded-xl">Ver resultados</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
