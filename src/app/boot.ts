import { yieldToMain } from '@/lib/yield-to-main'

async function startMocks(): Promise<void> {
  if (import.meta.env.VITE_ENABLE_MOCKS === 'false') return
  const { startMockWorker } = await import('@/mocks/browser')
  await yieldToMain()
  const heartbeat = new URLSearchParams(window.location.search).get('heartbeat') !== '0'
  await startMockWorker({ heartbeat })
}

export async function boot(): Promise<void> {
  await import('@/lib/zod-setup')
  await yieldToMain()

  const mocks = startMocks().catch((error: unknown) => {
    console.error('[bootstrap] mock layer failed to start', error)
  })
  const { mountApp } = await import('@/app/mount')
  await mocks
  await yieldToMain()
  mountApp()
}
