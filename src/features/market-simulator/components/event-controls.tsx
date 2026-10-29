import { Button } from '@/components/ui/button'

import { replayNftEvent, type ReplayMode } from '../api/simulator-api'
import type { SimulatorRun } from '../hooks/use-simulator-session'
import { SimulatorSection } from './simulator-section'

type EventControlsProps = {
  slug: string | null
  name: string
  busy: boolean
  run: SimulatorRun
}

const MODES: Array<{ mode: ReplayMode; label: string; done: string }> = [
  { mode: 'duplicate', label: 'Evento duplicado', done: 'mesmo evento reenviado' },
  { mode: 'stale', label: 'Evento antigo', done: 'evento anterior reenviado' },
]

export function EventControls({ slug, name, busy, run }: EventControlsProps) {
  function replay(mode: ReplayMode, done: string) {
    if (!slug) return
    void run(async () => {
      const result = await replayNftEvent(slug, mode)
      return `${name}: ${done} (versão ${result.version}) para ${result.delivered} cliente(s). O app deve ignorá-lo.`
    })
  }

  return (
    <SimulatorSection title="Eventos do Socket.IO">
      <div className="grid grid-cols-2 gap-2">
        {MODES.map((item) => (
          <Button
            key={item.mode}
            size="sm"
            variant="outline"
            disabled={busy || !slug}
            onClick={() => replay(item.mode, item.done)}
          >
            {item.label}
          </Button>
        ))}
      </div>
    </SimulatorSection>
  )
}
