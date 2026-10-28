export const ENS_SUFFIXES = ['.eth'] as const
export const DEFAULT_ENS_SUFFIX = ENS_SUFFIXES[0]

export function splitEnsName(value: string | null): { name: string; suffix: string } {
  const suffix = ENS_SUFFIXES.find((candidate) => value?.endsWith(candidate)) ?? DEFAULT_ENS_SUFFIX
  const name = value?.endsWith(suffix) ? value.slice(0, -suffix.length) : (value ?? '')
  return { name, suffix }
}

export function joinEnsName(name: string, suffix: string): string | null {
  const trimmed = name.trim()
  return trimmed ? `${trimmed}${suffix}` : null
}
