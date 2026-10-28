import { readJsonStorage, removeStorage, writeJsonStorage } from '@/lib/storage'

import { resetTiming } from './timing'
import {
  DEFAULT_SCENARIO,
  FAILURE_MODES,
  LATENCY_PROFILES,
  type FailureMode,
  type LatencyProfile,
  type ScenarioConfig,
} from './types'

const STORAGE_KEY = 'kurio:mock-scenario'

let current: ScenarioConfig = { ...DEFAULT_SCENARIO }

function isLatency(value: string | null): value is LatencyProfile {
  return value !== null && (LATENCY_PROFILES as readonly string[]).includes(value)
}

function isFailure(value: string | null): value is FailureMode {
  return value !== null && (FAILURE_MODES as readonly string[]).includes(value)
}

function applySearchParams(base: ScenarioConfig, search: string): ScenarioConfig {
  const params = new URLSearchParams(search)
  const next = { ...base }
  const latency = params.get('latency')
  const failure = params.get('failure')
  const scope = params.get('failScope')
  const failEvery = params.get('failEvery')
  const seed = params.get('seed')

  if (isLatency(latency)) next.latency = latency
  if (isFailure(failure)) next.failure = failure
  if (scope) next.scope = scope.split(',').filter(Boolean)
  if (failEvery) next.failEvery = Math.max(1, Number(failEvery) || DEFAULT_SCENARIO.failEvery)
  if (seed) next.seed = Number(seed) || DEFAULT_SCENARIO.seed
  return next
}

export function getScenario(): ScenarioConfig {
  return current
}

export function setScenario(patch: Partial<ScenarioConfig>): ScenarioConfig {
  current = { ...current, ...patch }
  resetTiming()
  writeJsonStorage(STORAGE_KEY, current)
  return current
}

export function resetScenario(): ScenarioConfig {
  removeStorage(STORAGE_KEY)
  current = { ...DEFAULT_SCENARIO }
  resetTiming()
  return current
}

export function loadScenario(search = window.location.search): ScenarioConfig {
  const stored = readJsonStorage<Partial<ScenarioConfig>>(STORAGE_KEY)
  current = applySearchParams({ ...DEFAULT_SCENARIO, ...stored }, search)
  return current
}
