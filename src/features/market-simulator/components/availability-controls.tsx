import { useState } from 'react'

import { Button } from '@/components/ui/button'

import { changeNft } from '../api/simulator-api'
import type { SimulatorRun } from '../hooks/use-simulator-session'
import { SIMULATOR_CONTROL } from './simulator-field'
import { SimulatorSection } from './simulator-section'

type AvailabilityControlsProps = {
  slug: string | null
  name: string
  edition: string
  busy: boolean
  run: SimulatorRun
}

export function AvailabilityControls({
  slug,
  name,
  edition,
  busy,
  run,
}: AvailabilityControlsProps) {
  const [draft, setDraft] = useState('1')

  function apply(available: number) {
    if (!slug) return
    void run(async () => {
      await changeNft(slug, { edition, available })
      return `Disponibilidade de ${name} (edição ${edition}) definida em ${available}.`
    })
  }

  return (
    <SimulatorSection title="Disponibilidade">
      <div className="flex gap-2">
        <input
          aria-label="Unidades disponíveis"
          type="number"
          min={0}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          className={SIMULATOR_CONTROL}
        />
        <Button
          size="sm"
          disabled={busy || !slug}
          onClick={() => apply(Math.max(0, Math.floor(Number(draft) || 0)))}
        >
          Definir
        </Button>
        <Button size="sm" variant="outline" disabled={busy || !slug} onClick={() => apply(0)}>
          Esgotar
        </Button>
      </div>
    </SimulatorSection>
  )
}
