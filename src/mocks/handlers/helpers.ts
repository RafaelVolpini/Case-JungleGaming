import { delay, HttpResponse } from 'msw'

import type { ApiErrorCode } from '@/contracts/common'

import { getDb } from '../db/store'
import type { SessionRecord, UserRecord } from '../db/types'
import { countRequest, getScenario, isInScope, resolveDelay } from '../scenarios/config'

export const API = '/api'

export const AUTH_HEADER = 'authorization'
export const VISITOR_HEADER = 'x-visitor-id'

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  VALIDATION_ERROR: 422,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  COUPON_INVALID: 422,
  COUPON_EXPIRED: 422,
  QUOTE_STALE: 409,
  SERVER_ERROR: 500,
}

export function errorResponse(
  code: ApiErrorCode,
  message: string,
  fields?: Record<string, string>,
) {
  return HttpResponse.json(
    { error: { code, message, ...(fields ? { fields } : {}) } },
    { status: STATUS_BY_CODE[code] },
  )
}

export async function simulateNetwork(request: Request): Promise<Response | null> {
  const config = getScenario()
  const { pathname } = new URL(request.url)

  await delay(resolveDelay(config))

  if (config.failure === 'none' || !isInScope(config, pathname)) return null

  switch (config.failure) {
    case 'offline':
      return HttpResponse.error()

    case 'server-error':
      return errorResponse('SERVER_ERROR', 'Falha temporária no servidor. Tente novamente.')

    case 'timeout':
      await delay('infinite')
      return null

    case 'intermittent':
      return countRequest(pathname) % config.failEvery === 0
        ? errorResponse('SERVER_ERROR', 'Falha temporária no servidor. Tente novamente.')
        : null

    case 'unauthorized':
      return errorResponse('UNAUTHENTICATED', 'Sua sessão expirou. Entre novamente.')

    default:
      return null
  }
}

export type Caller = {
  user: UserRecord | null
  session: SessionRecord | null
  visitorId: string | null
}

export function resolveCaller(request: Request): Caller {
  const db = getDb()
  const visitorId = request.headers.get(VISITOR_HEADER)
  const header = request.headers.get(AUTH_HEADER)
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) return { user: null, session: null, visitorId }

  const session = db.sessions.find((candidate) => candidate.token === token) ?? null
  if (!session) return { user: null, session: null, visitorId }

  if (new Date(session.expiresAt) <= new Date()) {
    db.sessions = db.sessions.filter((candidate) => candidate.token !== token)
    return { user: null, session: null, visitorId }
  }

  const user = db.users.find((candidate) => candidate.id === session.userId) ?? null
  return { user, session, visitorId }
}

export function requireUser(
  caller: Caller,
): { ok: true; user: UserRecord } | { ok: false; response: Response } {
  if (!caller.user) {
    return {
      ok: false,
      response: errorResponse('UNAUTHENTICATED', 'Entre na sua conta para continuar.'),
    }
  }
  return { ok: true, user: caller.user }
}

export function fieldErrors(
  issues: Array<{ path: PropertyKey[]; message: string }>,
): Record<string, string> {
  const fields: Record<string, string> = {}
  for (const issue of issues) {
    const key = issue.path.map(String).join('.') || '_'
    fields[key] ??= issue.message
  }
  return fields
}
