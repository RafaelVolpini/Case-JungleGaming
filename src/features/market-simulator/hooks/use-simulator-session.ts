import { useState } from 'react'

import { errorMessage } from '@/lib/http/errors'

const IDLE_MESSAGE = 'Pronto. Escolha um NFT e envie uma alteração.'

export function useSimulatorSession() {
  const [message, setMessage] = useState(IDLE_MESSAGE)
  const [busy, setBusy] = useState(false)

  async function run(task: () => Promise<string>) {
    setBusy(true)
    try {
      setMessage(await task())
    } catch (error) {
      setMessage(`Não foi possível concluir: ${errorMessage(error)}`)
    } finally {
      setBusy(false)
    }
  }

  return { message, busy, run, report: setMessage }
}

export type SimulatorRun = ReturnType<typeof useSimulatorSession>['run']
