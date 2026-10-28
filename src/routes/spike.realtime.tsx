import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'

import { SOCKET_OPTIONS } from '@/lib/realtime/constants'

export const Route = createFileRoute('/spike/realtime')({
  component: RealtimeSpikePage,
})

/**
 * Transport smoke test for the MSW × Socket.IO bridge (ARCHITECTURE.md §3).
 * It uses its own event map rather than the application contracts, because the
 * events it exercises are diagnostics and have no place in the real API.
 */
type SpikeServerEvents = {
  'spike:pong': (payload: unknown) => void
  'nft.updated': (payload: { id: string; version: number; available: number }) => void
}
type SpikeClientEvents = {
  'spike:ping': (payload: { n: number }) => void
  'session.identify': (payload: { userId: string | null }) => void
}
type SpikeSocket = Socket<SpikeServerEvents, SpikeClientEvents>

/**
 * Drives a REST mutation and lets the page observe the Socket.IO event it
 * produces — the end-to-end check that the database, the handlers and the
 * gateway agree.
 */
async function toggleFavoriteViaRest(): Promise<string> {
  const headers = { 'content-type': 'application/json' }

  const login = await fetch('/api/auth/login', {
    method: 'POST',
    headers,
    body: JSON.stringify({ email: 'ana@kurio.test', password: 'kurio-ana-2026' }),
  })
  if (!login.ok) return `login falhou (${login.status})`
  const { token } = (await login.json()) as { token: string }

  const list = await fetch('/api/nfts?page=2')
  const { items } = (await list.json()) as { items: Array<{ id: string; name: string }> }
  const target = items[0]
  if (!target) return 'nenhum NFT encontrado'

  const auth = { ...headers, authorization: `Bearer ${token}` }
  const ids = await fetch('/api/favorites/ids', { headers: auth })
  const { nftIds } = (await ids.json()) as { nftIds: string[] }
  const method = nftIds.includes(target.id) ? 'DELETE' : 'PUT'

  await fetch(`/api/favorites/${target.id}`, { method, headers: auth })
  return `${method} /favorites/${target.name}`
}

function RealtimeSpikePage() {
  const [log, setLog] = useState<string[]>([])
  const [connected, setConnected] = useState(false)
  const [uptime, setUptime] = useState(0)
  const socketRef = useRef<SpikeSocket | null>(null)

  const heartbeatOff =
    new URLSearchParams(window.location.search).get('heartbeat') === '0'

  useEffect(() => {
    const started = Date.now()
    const elapsed = () => Math.floor((Date.now() - started) / 1000)
    const ticker = setInterval(() => setUptime(elapsed()), 1000)

    const append = (line: string) =>
      setLog((prev) => [...prev, `${String(elapsed()).padStart(3, '0')}s  ${line}`])

    const socket: SpikeSocket = io(window.location.origin, SOCKET_OPTIONS)
    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      append(`connect — id=${socket.id} transport=${socket.io.engine.transport.name}`)
    })
    socket.on('disconnect', (reason) => {
      setConnected(false)
      append(`disconnect — ${reason}`)
    })
    socket.on('connect_error', (error) => append(`connect_error — ${error.message}`))
    socket.on('spike:pong', (payload) => append(`spike:pong ${JSON.stringify(payload)}`))
    socket.on('nft.updated', (payload) =>
      append(`nft.updated id=${payload.id} v=${payload.version} disp=${payload.available}`),
    )

    append('connecting…')
    socket.connect()

    return () => {
      clearInterval(ticker)
      socket.removeAllListeners()
      socket.disconnect()
    }
  }, [])

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-12">
      <header className="space-y-1">
        <h1 className="text-cream text-xl font-bold">Spike — MSW × Socket.IO</h1>
        <p className="text-muted-foreground text-sm">
          Heartbeat{' '}
          {heartbeatOff ? 'DESLIGADO (esperado: ping timeout aos ~30s)' : 'LIGADO'}
        </p>
      </header>

      <div className="flex items-center gap-4 text-sm">
        <span
          data-testid="status"
          className={connected ? 'text-primary font-bold' : 'text-destructive font-bold'}
        >
          {connected ? '● conectado' : '○ desconectado'}
        </span>
        <span className="text-muted-foreground">uptime {uptime}s</span>
        <button
          type="button"
          onClick={() => socketRef.current?.emit('spike:ping', { n: Date.now() })}
          className="border-primary text-primary rounded-md border px-3 py-1 text-xs font-bold"
        >
          emit spike:ping
        </button>
        <button
          type="button"
          onClick={() => {
            void toggleFavoriteViaRest().then((line) =>
              setLog((prev) => [...prev, `---  REST: ${line}`]),
            )
          }}
          className="border-primary text-primary rounded-md border px-3 py-1 text-xs font-bold"
        >
          mutação REST → evento
        </button>
      </div>

      <pre
        data-testid="log"
        className="bg-card border-border max-h-96 overflow-auto rounded-lg border p-4 text-xs leading-relaxed"
      >
        {log.join('\n')}
      </pre>
    </main>
  )
}
