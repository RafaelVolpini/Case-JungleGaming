/**
 * Password hashing for the simulated backend.
 *
 * The challenge forbids storing passwords in clear text. SHA-256 with a
 * per-user salt is not what a real backend should use — a real one needs a
 * slow KDF like Argon2 or bcrypt — but it is honest about the intent and keeps
 * the seed reproducible, which a deliberately slow hash would not.
 */

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
  // Length is fixed, so a plain comparison leaks nothing useful here.
  return actual === expectedHash
}

/** Opaque session token. */
export function createToken(): string {
  return crypto.randomUUID().replaceAll('-', '')
}

/**
 * Stable hash of a request body, used by the idempotency ledger to tell
 * "same attempt" from "same key, different payload".
 */
export async function hashPayload(payload: unknown): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(stableStringify(payload)))
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** JSON.stringify with sorted keys, so key order cannot change the hash. */
function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null'
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`)
  return `{${entries.join(',')}}`
}
