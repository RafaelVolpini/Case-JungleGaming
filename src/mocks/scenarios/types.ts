export const LATENCY_PROFILES = ['none', 'fast', 'slow', 'variable', 'out-of-order'] as const
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

export const PAYMENT_OUTCOMES = ['confirm', 'decline'] as const
export type PaymentOutcome = (typeof PAYMENT_OUTCOMES)[number]

export type ScenarioConfig = {
  latency: LatencyProfile
  failure: FailureMode
  scope: string[]
  failEvery: number
  seed: number
  payment: PaymentOutcome
  orderTimeout: boolean
}

export const DEFAULT_SCENARIO: ScenarioConfig = {
  latency: 'fast',
  failure: 'none',
  scope: [],
  failEvery: 3,
  seed: 1,
  payment: 'confirm',
  orderTimeout: false,
}
