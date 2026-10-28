import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { eth } from '@/contracts/common'

import { PRICE_MAX, PRICE_MIN, PRICE_STEP } from '../../constants'
import { useCatalogFilters } from '../../hooks/use-catalog-filters'

type Apply = ReturnType<typeof useCatalogFilters>['update']

const formatBound = (value: number) => value.toFixed(2).replace('.', ',')

export function PriceFilter() {
  const { query, update } = useCatalogFilters()
  const appliedKey = `${query.minPriceEth ?? ''}-${query.maxPriceEth ?? ''}`

  return (
    <PriceRange
      key={appliedKey}
      initialMin={query.minPriceEth}
      initialMax={query.maxPriceEth}
      onApply={update}
    />
  )
}

type PriceRangeProps = { initialMin?: string; initialMax?: string; onApply: Apply }

function PriceRange({ initialMin, initialMax, onApply }: PriceRangeProps) {
  const [range, setRange] = useState<number[]>([
    initialMin ? Number(initialMin) : PRICE_MIN,
    initialMax ? Number(initialMax) : PRICE_MAX,
  ])
  const [low = PRICE_MIN, high = PRICE_MAX] = range

  function apply() {
    onApply({
      minPriceEth: low > PRICE_MIN ? eth(low.toFixed(2)) : undefined,
      maxPriceEth: high < PRICE_MAX ? eth(high.toFixed(2)) : undefined,
    })
  }

  return (
    <section aria-label="Faixa de preço">
      <h2 className="text-cream text-lg leading-6 font-bold">Faixa de preço</h2>
      <Slider
        className="mt-[11px] px-3"
        min={PRICE_MIN}
        max={PRICE_MAX}
        step={PRICE_STEP}
        minStepsBetweenThumbs={1}
        value={range}
        onValueChange={setRange}
        aria-label="Faixa de preço em ETH"
      />
      <p className="text-cream mt-[13px] px-3 text-[15px] leading-[22px]" aria-live="polite">
        Preço: {formatBound(low)} - {formatBound(high)} ETH
      </p>
      <Button size="sm" className="mt-[11px] ml-3 h-9 rounded-lg px-6 text-[15px]" onClick={apply}>
        Aplicar
      </Button>
    </section>
  )
}
