import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  FAILURE_MODES,
  LATENCY_PROFILES,
  type FailureMode,
  type LatencyProfile,
  type ScenarioConfig,
} from '@/contracts/mock-scenario'

import { patchScenario, readScenario } from '../api/simulator-api'
import type { SimulatorRun } from '../hooks/use-simulator-session'
import { FAILURE_LABELS, LATENCY_LABELS } from '../lib/scenario-labels'
import { SIMULATOR_CONTROL, SimulatorSelect } from './simulator-field'
import { SimulatorSection } from './simulator-section'

type ScenarioFormProps = { initial: ScenarioConfig; busy: boolean; run: SimulatorRun }

function ScenarioForm({ initial, busy, run }: ScenarioFormProps) {
  const [latency, setLatency] = useState<LatencyProfile>(initial.latency)
  const [failure, setFailure] = useState<FailureMode>(initial.failure)
  const [scope, setScope] = useState(initial.scope.join(','))
  const [decline, setDecline] = useState(initial.payment === 'decline')
  const [reject, setReject] = useState(initial.wallet === 'reject')
  const [orderTimeout, setOrderTimeout] = useState(initial.orderTimeout)

  function apply() {
    void run(async () => {
      await patchScenario({
        latency,
        failure,
        scope: scope
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        payment: decline ? 'decline' : 'confirm',
        wallet: reject ? 'reject' : 'accept',
        orderTimeout,
      })
      return `Cenário aplicado: latência ${LATENCY_LABELS[latency]}, falha ${FAILURE_LABELS[failure]}.`
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2">
        <SimulatorSelect
          label="Latência"
          value={latency}
          onChange={(event) => setLatency(event.target.value as LatencyProfile)}
        >
          {LATENCY_PROFILES.map((item) => (
            <option key={item} value={item}>
              {LATENCY_LABELS[item]}
            </option>
          ))}
        </SimulatorSelect>
        <SimulatorSelect
          label="Falha"
          value={failure}
          onChange={(event) => setFailure(event.target.value as FailureMode)}
        >
          {FAILURE_MODES.map((item) => (
            <option key={item} value={item}>
              {FAILURE_LABELS[item]}
            </option>
          ))}
        </SimulatorSelect>
      </div>
      <input
        aria-label="Escopo da falha"
        placeholder="Escopo da falha, ex.: /api/nfts (vazio = tudo)"
        value={scope}
        onChange={(event) => setScope(event.target.value)}
        className={SIMULATOR_CONTROL}
      />
      <div className="text-foreground flex flex-col gap-1 text-xs">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={decline}
            onChange={(event) => setDecline(event.target.checked)}
          />
          Pagamento recusado
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={reject}
            onChange={(event) => setReject(event.target.checked)}
          />
          A carteira recusa a conexão
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={orderTimeout}
            onChange={(event) => setOrderTimeout(event.target.checked)}
          />
          Timeout após criar o pedido
        </label>
      </div>
      <Button size="sm" disabled={busy} onClick={apply}>
        Aplicar cenário
      </Button>
    </div>
  )
}

export function ScenarioControls({ busy, run }: { busy: boolean; run: SimulatorRun }) {
  const { data } = useQuery({ queryKey: ['simulator', 'scenario'], queryFn: readScenario })

  return (
    <SimulatorSection title="Cenário de rede">
      {data ? (
        <ScenarioForm key={JSON.stringify(data)} initial={data} busy={busy} run={run} />
      ) : (
        <p className="text-foreground text-xs">Carregando o cenário…</p>
      )}
    </SimulatorSection>
  )
}
