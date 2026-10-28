const REGISTRABLE_LABELS = 2

export function getDomain(hostname: string): string | null {
  const labels = hostname.split('.')
  return labels.length >= REGISTRABLE_LABELS ? labels.slice(-REGISTRABLE_LABELS).join('.') : null
}
