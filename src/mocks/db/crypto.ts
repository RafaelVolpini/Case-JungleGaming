const encoder = new TextEncoder()

export async function hashPassword(password: string, salt: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(`${salt}:${password}`))
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function verifyPassword(
  password: string,
  salt: string,
  expectedHash: string,
): Promise<boolean> {
  const actual = await hashPassword(password, salt)
  return actual === expectedHash
}

export function createToken(): string {
  return crypto.randomUUID().replaceAll('-', '')
}

export async function hashPayload(payload: unknown): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(stableStringify(payload)))
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null'
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`)
  return `{${entries.join(',')}}`
}
