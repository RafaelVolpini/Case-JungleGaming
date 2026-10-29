import { lazy, Suspense, useEffect, useState } from 'react'

import { MOCKS_ENABLED } from '@/lib/mocks-enabled'

import { SIMULATOR_REQUESTED_AT_LOAD } from './open-request'

const MarketSimulator = lazy(() => import('./components/market-simulator'))

function isToggleShortcut(event: KeyboardEvent): boolean {
  return event.ctrlKey && event.altKey && event.code === 'KeyM'
}

export function SimulatorHost() {
  const [open, setOpen] = useState(SIMULATOR_REQUESTED_AT_LOAD)

  useEffect(() => {
    if (!MOCKS_ENABLED) return
    const onKey = (event: KeyboardEvent) => {
      if (!isToggleShortcut(event)) return
      event.preventDefault()
      setOpen((current) => !current)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!MOCKS_ENABLED || !open) return null
  return (
    <Suspense fallback={null}>
      <MarketSimulator onClose={() => setOpen(false)} />
    </Suspense>
  )
}
