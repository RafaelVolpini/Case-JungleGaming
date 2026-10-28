export const LATENCY_PROFILES = [
  'none',
  'fast',
  'slow',
  'variable',
  'out-of-order',
] as const
export type LatencyProfile = (typeof LATENCY_PROFILES)[number]

export const FAILURE_MODES = [
  'none',
  'offline',
  'server-error',
  'timeout',
  'intermittent',
  'unauthorized',
] as const
export type FailureMode = (typeof FAILURE_MODES)[number]

export type ScenarioConfig = {
  latency: LatencyProfile
  failure: FailureMode
  scope: string[]
  failEvery: number
  seed: number
}

export const DEFAULT_SCENARIO: ScenarioConfig = {
  latency: 'fast',
  failure: 'none',
  scope: [],
  failEvery: 3,
  seed: 1,
}

const STORAGE_KEY = 'kurio:mock-scenario'

let current: ScenarioConfig = { ...DEFAULT_SCENARIO }

export function getScenario(): ScenarioConfig {
  return current
}

export function setScenario(patch: Partial<ScenarioConfig>): ScenarioConfig {
  current = { ...current, ...patch }
  requestCounts.clear()
  latencyCursor = 0
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
  } catch {
    return
  }
  return current
}

export function resetScenario(): ScenarioConfig {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    return
  }
  current = { ...DEFAULT_SCENARIO }
  requestCounts.clear()
  latencyCursor = 0
  return current
}

export function loadScenario(search = window.location.search): ScenarioConfig {
  let next: ScenarioConfig = { ...DEFAULT_SCENARIO }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) next = { ...next, ...(JSON.parse(raw) as Partial<ScenarioConfig>) }
  } catch {
    return
  }

  const params = new URLSearchParams(search)
  const latency = params.get('latency')
  const failure = params.get('failure')
  const scope = params.get('failScope')
  const failEvery = params.get('failEvery')
  const seed = params.get('seed')

  if (latency && (LATENCY_PROFILES as readonly string[]).includes(latency)) {
    next.latency = latency as LatencyProfile
  }
  if (failure && (FAILURE_MODES as readonly string[]).includes(failure)) {
    next.failure = failure as FailureMode
  }
  if (scope) next.scope = scope.split(',').filter(Boolean)
  if (failEvery) next.failEvery = Math.max(1, Number(failEvery) || DEFAULT_SCENARIO.failEvery)
  if (seed) next.seed = Number(seed) || DEFAULT_SCENARIO.seed

  current = next
  return current
}

const requestCounts = new Map<string, number>()
let latencyCursor = 0

export function countRequest(pathname: string): number {
  const next = (requestCounts.get(pathname) ?? 0) + 1
  requestCounts.set(pathname, next)
  return next
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const OUT_OF_ORDER_DELAYS = [1400, 1050, 700, 350, 60]

export function resolveDelay(config: ScenarioConfig): number {
  switch (config.latency) {
    case 'none':
      return 0
    case 'fast':
      return 120
    case 'slow':
      return 1500
    case 'variable': {
      const random = mulberry32(config.seed + latencyCursor++)
      return Math.round(100 + random() * 1900)
    }
    case 'out-of-order': {
      const delay = OUT_OF_ORDER_DELAYS[latencyCursor % OUT_OF_ORDER_DELAYS.length] ?? 0
      latencyCursor += 1
      return delay
    }
  }
}

export function isInScope(config: ScenarioConfig, pathname: string): boolean {
  if (config.scope.length === 0) return true
  return config.scope.some((prefix) => pathname.startsWith(prefix))
}
