import type { FailureMode, LatencyProfile } from '@/contracts/mock-scenario'

export const LATENCY_LABELS: Record<LatencyProfile, string> = {
  none: 'Sem atraso',
  fast: 'Rápida (120 ms)',
  slow: 'Lenta (1,5 s)',
  variable: 'Variável',
  'out-of-order': 'Respostas fora de ordem',
}

export const FAILURE_LABELS: Record<FailureMode, string> = {
  none: 'Nenhuma',
  offline: 'Sem conexão',
  'server-error': 'Erro 500',
  timeout: 'Timeout',
  intermittent: 'Intermitente',
  unauthorized: 'Sessão inválida (401)',
}
