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
