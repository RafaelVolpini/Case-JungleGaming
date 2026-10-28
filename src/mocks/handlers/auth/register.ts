import { http, HttpResponse } from 'msw'

import { registerSchema } from '@/contracts/session'

import { mergeVisitorCart } from '../../db/carts'
import { hashPassword } from '../../db/crypto'
import { getDb, persist } from '../../db/store'
import type { UserRecord } from '../../db/types'
import { API, VISITOR_HEADER } from '../constants'
import { errorResponse, validationError } from '../errors'
import { simulated } from '../network'
import { issueSession, sessionPayload } from './shared'

function findConflicts(username: string, email: string): Record<string, string> {
  const { users } = getDb()
  const conflicts: Record<string, string> = {}
  if (users.some((user) => user.email.toLowerCase() === email)) {
    conflicts['email'] = 'Este e-mail já está cadastrado.'
  }
  if (users.some((user) => user.username.toLowerCase() === username.toLowerCase())) {
    conflicts['username'] = 'Este nome de usuário já está em uso.'
  }
  return conflicts
}

export const registerHandler = http.post(
  `${API}/auth/register`,
  simulated(async ({ request }) => {
    const parsed = registerSchema.safeParse(await request.json().catch(() => ({})))
    if (!parsed.success) {
      return validationError('Revise os campos destacados.', parsed.error.issues)
    }

    const { username, email, password } = parsed.data
    const normalizedEmail = email.toLowerCase()
    const conflicts = findConflicts(username, normalizedEmail)
    if (Object.keys(conflicts).length > 0) {
      return errorResponse('CONFLICT', 'Não foi possível criar a conta.', conflicts)
    }

    const id = `user-${crypto.randomUUID().slice(0, 8)}`
    const passwordSalt = `${id}-salt`
    const user: UserRecord = {
      id,
      displayName: username,
      username,
      email: normalizedEmail,
      passwordHash: await hashPassword(password, passwordSalt),
      passwordSalt,
      ensName: null,
      avatarEmoji: '🦧',
      createdAt: new Date().toISOString(),
    }

    const db = getDb()
    db.users.push(user)
    db.favorites[user.id] = []
    const session = issueSession(user)
    mergeVisitorCart(request.headers.get(VISITOR_HEADER), user.id)
    persist()

    return HttpResponse.json(sessionPayload(user, session), { status: 201 })
  }),
)
