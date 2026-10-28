import { http, HttpResponse } from 'msw'

import { loginSchema, registerSchema } from '@/contracts/session'

import { mergeVisitorCart } from '../db/carts'
import { createToken, hashPassword, verifyPassword } from '../db/crypto'
import { getDb, persist } from '../db/store'
import type { UserRecord } from '../db/types'
import {
  API,
  errorResponse,
  fieldErrors,
  resolveCaller,
  simulateNetwork,
  VISITOR_HEADER,
} from './helpers'

const SESSION_TTL_MS = 30 * 60 * 1000

function toUser(user: UserRecord) {
  const { passwordHash: _hash, passwordSalt: _salt, ...safe } = user
  return safe
}

function issueSession(user: UserRecord) {
  const db = getDb()
  const session = {
    token: createToken(),
    userId: user.id,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
  }
  db.sessions.push(session)
  return session
}

export const authHandlers = [
  http.post(`${API}/auth/register`, async ({ request }) => {
    const failure = await simulateNetwork(request)
    if (failure) return failure

    const parsed = registerSchema.safeParse(await request.json().catch(() => ({})))
    if (!parsed.success) {
      return errorResponse(
        'VALIDATION_ERROR',
        'Revise os campos destacados.',
        fieldErrors(parsed.error.issues),
      )
    }

    const db = getDb()
    const { username, email, password } = parsed.data
    const normalizedEmail = email.toLowerCase()

    const conflicts: Record<string, string> = {}
    if (db.users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
      conflicts['email'] = 'Este e-mail já está cadastrado.'
    }
    if (db.users.some((user) => user.username.toLowerCase() === username.toLowerCase())) {
      conflicts['username'] = 'Este nome de usuário já está em uso.'
    }
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

    db.users.push(user)
    db.favorites[user.id] = []
    const session = issueSession(user)
    mergeVisitorCart(request.headers.get(VISITOR_HEADER), user.id)
    persist()

    return HttpResponse.json(
      { token: session.token, user: toUser(user), expiresAt: session.expiresAt },
      { status: 201 },
    )
  }),

  http.post(`${API}/auth/login`, async ({ request }) => {
    const failure = await simulateNetwork(request)
    if (failure) return failure

    const parsed = loginSchema.safeParse(await request.json().catch(() => ({})))
    if (!parsed.success) {
      return errorResponse(
        'VALIDATION_ERROR',
        'Revise os campos destacados.',
        fieldErrors(parsed.error.issues),
      )
    }

    const db = getDb()
    const user = db.users.find(
      (candidate) => candidate.email.toLowerCase() === parsed.data.email.toLowerCase(),
    )

    const valid =
      user !== undefined &&
      (await verifyPassword(parsed.data.password, user.passwordSalt, user.passwordHash))

    if (!user || !valid) {
      return errorResponse('UNAUTHENTICATED', 'E-mail ou senha inválidos.')
    }

    const session = issueSession(user)
    mergeVisitorCart(request.headers.get(VISITOR_HEADER), user.id)
    persist()

    return HttpResponse.json({
      token: session.token,
      user: toUser(user),
      expiresAt: session.expiresAt,
    })
  }),

  http.get(`${API}/auth/session`, async ({ request }) => {
    const failure = await simulateNetwork(request)
    if (failure) return failure

    const caller = resolveCaller(request)
    if (!caller.user || !caller.session) {
      return errorResponse('UNAUTHENTICATED', 'Sessão expirada ou inexistente.')
    }

    return HttpResponse.json({
      user: toUser(caller.user),
      expiresAt: caller.session.expiresAt,
    })
  }),

  http.post(`${API}/auth/logout`, async ({ request }) => {
    const failure = await simulateNetwork(request)
    if (failure) return failure

    const caller = resolveCaller(request)
    if (caller.session) {
      const db = getDb()
      db.sessions = db.sessions.filter((session) => session.token !== caller.session?.token)
      persist()
    }

    return new HttpResponse(null, { status: 204 })
  }),
]
