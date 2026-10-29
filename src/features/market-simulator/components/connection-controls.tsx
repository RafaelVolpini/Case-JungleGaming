import { useQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'

import { dropSocket, readSocketState, reconnectSocket } from '../api/simulator-api'
import type { SimulatorRun } from '../hooks/use-simulator-session'
import { SimulatorSection } from './simulator-section'

const POLL_MS = 1500
const SHORT_DROP_MS = 5_000
const LONG_DROP_MS = 20_000

function describe(clients: number | undefined, outageMs: number | undefined): string {
  if (clients === undefined) return 'Verificando a conexão…'
  if (outageMs && outageMs > 0) return `Queda simulada: ${Math.ceil(outageMs / 1000)} s restantes`
  return clients > 0 ? `Conectado (${clients} cliente)` : 'Desconectado, tentando reconectar'
}

export function ConnectionControls({ busy, run }: { busy: boolean; run: SimulatorRun }) {
  const { data } = useQuery({
    queryKey: ['simulator', 'socket'],
    queryFn: readSocketState,
    refetchInterval: POLL_MS,
  })

  function drop(holdMs: number) {
    void run(async () => {
      await dropSocket(holdMs)
      return holdMs > 0
        ? `Conexão derrubada por ${holdMs / 1000} s. Altere preços agora e reconecte para ver a reconciliação.`
        : 'Conexão derrubada. O cliente reconecta sozinho e reconcilia com a API.'
    })
  }

  return (
    <SimulatorSection title="Conexão">
      <p className="text-foreground mb-2 text-xs" data-testid="simulator-connection">
        {describe(data?.clients, data?.outageMs)}
      </p>
      <div className="grid grid-cols-3 gap-2">
        <Button size="sm" variant="outline" disabled={busy} onClick={() => drop(0)}>
          Derrubar
        </Button>
        <Button size="sm" variant="outline" disabled={busy} onClick={() => drop(SHORT_DROP_MS)}>
          Segurar 5 s
        </Button>
        <Button size="sm" variant="outline" disabled={busy} onClick={() => drop(LONG_DROP_MS)}>
          Segurar 20 s
        </Button>
      </div>
      <Button
        size="sm"
        className="mt-2 w-full"
        disabled={busy}
        onClick={() =>
          void run(async () => {
            await reconnectSocket()
            return 'Queda encerrada. O cliente tenta reconectar agora.'
          })
        }
      >
        Reconectar agora
      </Button>
    </SimulatorSection>
  )
}
