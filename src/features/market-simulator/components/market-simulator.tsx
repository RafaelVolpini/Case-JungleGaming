import { X } from 'lucide-react'
import { useEffect } from 'react'

import { useSimulatorSession } from '../hooks/use-simulator-session'
import { useSimulatorTarget } from '../hooks/use-simulator-target'
import { AvailabilityControls } from './availability-controls'
import { ConnectionControls } from './connection-controls'
import { EventControls } from './event-controls'
import { PriceControls } from './price-controls'
import { RestoreControl } from './restore-control'
import { ScenarioControls } from './scenario-controls'
import { TargetPicker } from './target-picker'

export default function MarketSimulator({ onClose }: { onClose: () => void }) {
  const target = useSimulatorTarget()
  const { message, busy, run } = useSimulatorSession()
  const name = target.detail?.name ?? target.slug ?? 'NFT'

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <aside
      aria-label="Simulador de mercado"
      className="bg-card border-primary/40 shadow-modal pointer-events-auto fixed inset-x-3 bottom-[107px] z-[70] flex max-h-[70dvh] flex-col gap-3 overflow-y-auto rounded-2xl border p-4 text-sm md:inset-x-auto md:bottom-4 md:left-4 md:w-[380px]"
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-cream text-base font-bold">Simulador de mercado</h2>
          <p className="text-foreground text-xs">
            Envia alterações pelo MSW; o app as recebe pelo Socket.IO.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar simulador"
          className="text-primary focus-visible:ring-ring rounded-sm outline-none focus-visible:ring-2"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </header>
      <p role="status" aria-live="polite" className="text-primary-light text-xs">
        {message}
      </p>
      <TargetPicker
        options={target.options}
        slug={target.slug}
        edition={target.edition}
        detail={target.detail}
        onNft={target.chooseNft}
        onEdition={target.chooseEdition}
      />
      <PriceControls
        slug={target.slug}
        name={name}
        price={target.detail?.priceEth}
        busy={busy}
        run={run}
      />
      <AvailabilityControls
        slug={target.slug}
        name={name}
        edition={target.edition}
        busy={busy}
        run={run}
      />
      <EventControls slug={target.slug} name={name} busy={busy} run={run} />
      <ConnectionControls busy={busy} run={run} />
      <ScenarioControls busy={busy} run={run} />
      <RestoreControl busy={busy} run={run} />
    </aside>
  )
}
