import { http, HttpResponse } from 'msw'

import { loginSchema } from '@/contracts/session'

import { mergeVisitorCart } from '../../db/carts'
import { verifyPassword } from '../../db/crypto'
import { getDb, persist } from '../../db/store'
import { API, VISITOR_HEADER } from '../constants'
import { errorResponse, validationError } from '../errors'
import { simulated } from '../network'
import { issueSession, sessionPayload } from './shared'

export const loginHandler = http.post(
  `${API}/auth/login`,
  simulated(async ({ request }) => {
    const parsed = loginSchema.safeParse(await request.json().catch(() => ({})))
    if (!parsed.success) {
      return validationError('Revise os campos destacados.', parsed.error.issues)
    }

    const email = parsed.data.email.toLowerCase()
    const user = getDb().users.find((candidate) => candidate.email.toLowerCase() === email)
    const valid =
      user !== undefined &&
      (await verifyPassword(parsed.data.password, user.passwordSalt, user.passwordHash))

    if (!user || !valid) {
      return errorResponse('UNAUTHENTICATED', 'E-mail ou senha inválidos.')
    }

    const session = issueSession(user)
    mergeVisitorCart(request.headers.get(VISITOR_HEADER), user.id)
    persist()

    return HttpResponse.json(sessionPayload(user, session))
  }),
)
