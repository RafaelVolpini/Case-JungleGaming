import { http, HttpResponse } from 'msw'

import { getDb, persist } from '../../db/store'
import { API } from '../constants'
import { errorResponse } from '../errors'
import { resolveCaller } from '../identity'
import { simulated } from '../network'
import { toPublicUser } from './shared'

export const sessionHandler = http.get(
  `${API}/auth/session`,
  simulated(({ request }) => {
    const caller = resolveCaller(request)
    if (!caller.user || !caller.session) {
      return errorResponse('UNAUTHENTICATED', 'Sessão expirada ou inexistente.')
    }
    return HttpResponse.json({
      user: toPublicUser(caller.user),
      expiresAt: caller.session.expiresAt,
    })
  }),
)

export const logoutHandler = http.post(
  `${API}/auth/logout`,
  simulated(({ request }) => {
    const { session } = resolveCaller(request)
    if (session) {
      const db = getDb()
      db.sessions = db.sessions.filter((candidate) => candidate.token !== session.token)
      persist()
    }
    return new HttpResponse(null, { status: 204 })
  }),
)
