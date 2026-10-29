let outageEndsAt = 0

export function holdConnections(durationMs: number): void {
  outageEndsAt = Date.now() + Math.max(0, durationMs)
}

export function releaseConnections(): void {
  outageEndsAt = 0
}

export function outageRemainingMs(): number {
  return Math.max(0, outageEndsAt - Date.now())
}

export function isOutageActive(): boolean {
  return outageRemainingMs() > 0
}

type RefusableClient = { close: (code?: number, reason?: string) => void }

export function refuseConnection(client: RefusableClient): void {
  const { socket } = client as { socket?: EventTarget }
  socket?.dispatchEvent(new Event('error'))
  client.close(1006, 'Simulated outage')
}
