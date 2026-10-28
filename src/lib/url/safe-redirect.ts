const AUTH_PATHS = ['/entrar', '/criar-conta']
const BACKSLASH = String.fromCharCode(92)
const FIRST_PRINTABLE = 32

function hasUnsafeCharacter(value: string): boolean {
  return (
    value.includes(BACKSLASH) || [...value].some((char) => char.charCodeAt(0) < FIRST_PRINTABLE)
  )
}

export function sanitizeRedirect(value: string | undefined, fallback = '/'): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback
  if (hasUnsafeCharacter(value)) return fallback
  if (AUTH_PATHS.some((path) => value === path || value.startsWith(`${path}?`))) return fallback
  return value
}
