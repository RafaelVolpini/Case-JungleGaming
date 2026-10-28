import { createToken } from '../../db/crypto'
import { getDb } from '../../db/store'
import type { UserRecord } from '../../db/types'

const SESSION_TTL_MS = 30 * 60 * 1000

export function toPublicUser(user: UserRecord) {
  const { passwordHash: _hash, passwordSalt: _salt, ...safe } = user
  return safe
}

export function issueSession(user: UserRecord) {
  const session = {
    token: createToken(),
    userId: user.id,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
  }
  getDb().sessions.push(session)
  return session
}

export function sessionPayload(user: UserRecord, session: { token: string; expiresAt: string }) {
  return { token: session.token, user: toPublicUser(user), expiresAt: session.expiresAt }
}
