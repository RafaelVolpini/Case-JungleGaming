import { Button } from '@/components/ui/button'
import { clearPrivateData } from '@/features/auth/lib/clear-private-data'

import { resetMockData } from '../api/simulator-api'
import type { SimulatorRun } from '../hooks/use-simulator-session'
import { SimulatorSection } from './simulator-section'

export function RestoreControl({ busy, run }: { busy: boolean; run: SimulatorRun }) {
  function restore() {
    void run(async () => {
      await resetMockData()
      clearPrivateData()
      window.location.assign(window.location.pathname)
      return 'Dados e cenário restaurados. Recarregando…'
    })
  }

  return (
    <SimulatorSection title="Restaurar">
      <Button size="sm" variant="outline" className="w-full" disabled={busy} onClick={restore}>
        Restaurar dados e cenário (recarrega)
      </Button>
    </SimulatorSection>
  )
}
