import { isAxiosError } from 'axios'

import { apiErrorSchema, type ApiErrorCode } from '@/contracts/common'

export type FailureKind = 'network' | 'timeout' | 'http'

export class ApiRequestError extends Error {
  readonly kind: FailureKind
  readonly status: number | null
  readonly code: ApiErrorCode | null
  readonly fields: Record<string, string>

  constructor(init: {
    kind: FailureKind
    message: string
    status?: number | null
    code?: ApiErrorCode | null
    fields?: Record<string, string>
  }) {
    super(init.message)
    this.name = 'ApiRequestError'
    this.kind = init.kind
    this.status = init.status ?? null
    this.code = init.code ?? null
    this.fields = init.fields ?? {}
  }

  get isTransient(): boolean {
    return this.kind !== 'http' || (this.status !== null && this.status >= 500)
  }
}

export const NETWORK_MESSAGE = 'Não foi possível conectar. Verifique sua conexão e tente novamente.'
const TIMEOUT_MESSAGE = 'A solicitação demorou demais para responder. Tente novamente.'
const GENERIC_MESSAGE = 'Algo deu errado. Tente novamente.'

export function toApiRequestError(error: unknown): ApiRequestError {
  if (error instanceof ApiRequestError) return error

  if (!isAxiosError(error)) {
    return new ApiRequestError({ kind: 'network', message: GENERIC_MESSAGE })
  }

  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return new ApiRequestError({ kind: 'timeout', message: TIMEOUT_MESSAGE })
  }

  if (!error.response) {
    return new ApiRequestError({ kind: 'network', message: NETWORK_MESSAGE })
  }

  const parsed = apiErrorSchema.safeParse(error.response.data)
  if (!parsed.success) {
    return new ApiRequestError({
      kind: 'http',
      status: error.response.status,
      message: GENERIC_MESSAGE,
    })
  }

  const { code, message, fields } = parsed.data.error
  return new ApiRequestError({ kind: 'http', status: error.response.status, code, message, fields })
}

export function errorMessage(error: unknown): string {
  return toApiRequestError(error).message
}
