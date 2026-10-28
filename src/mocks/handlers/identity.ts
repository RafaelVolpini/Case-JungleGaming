import { getDb } from '../db/store'
import type { SessionRecord, UserRecord } from '../db/types'
import { AUTH_HEADER, VISITOR_HEADER } from './constants'
import { errorResponse } from './errors'

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
