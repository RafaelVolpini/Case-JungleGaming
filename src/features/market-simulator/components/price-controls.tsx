import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { ethAmountSchema, type EthAmount } from '@/contracts/common'
import { formatEth } from '@/lib/money/eth'

import { changeNft } from '../api/simulator-api'
import type { SimulatorRun } from '../hooks/use-simulator-session'
import { PRICE_STEPS, stepLabel, stepPrice } from '../lib/price-steps'
import { SIMULATOR_CONTROL } from './simulator-field'
import { SimulatorSection } from './simulator-section'

type PriceControlsProps = {
  slug: string | null
  name: string
  price: EthAmount | undefined
  busy: boolean
  run: SimulatorRun
}

export function PriceControls({ slug, name, price, busy, run }: PriceControlsProps) {
  const [draft, setDraft] = useState('')

  function apply(next: EthAmount) {
    if (!slug) return
    void run(async () => {
      const result = await changeNft(slug, { priceEth: next })
      return `Preço de ${name} alterado para ${formatEth(result.priceEth)} (versão ${result.version}).`
    })
  }

  function applyDraft() {
    const parsed = ethAmountSchema.safeParse(draft.trim())
    if (parsed.success) apply(parsed.data)
    else void run(async () => 'Informe um valor decimal em ETH, por exemplo 2.00.')
  }

  return (
    <SimulatorSection title="Preço">
      <div className="flex gap-2">
        <input
          aria-label="Novo preço em ETH"
          inputMode="decimal"
          placeholder="Novo preço, ex.: 2.00"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          className={SIMULATOR_CONTROL}
        />
        <Button size="sm" disabled={busy || !slug} onClick={applyDraft}>
          Aplicar
        </Button>
      </div>
      <div className="mt-2 grid grid-cols-4 gap-2">
        {PRICE_STEPS.map((step) => (
          <Button
            key={step}
            size="sm"
            variant="outline"
            disabled={busy || !slug || !price}
            aria-label={`Alterar o preço em ${stepLabel(step)}`}
            onClick={() => price && apply(stepPrice(price, step))}
          >
            {stepLabel(step)}
          </Button>
        ))}
      </div>
    </SimulatorSection>
  )
}
