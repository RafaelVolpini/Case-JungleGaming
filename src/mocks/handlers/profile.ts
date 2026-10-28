import { http, HttpResponse } from 'msw'

import { changePasswordSchema, updateProfileSchema } from '@/contracts/session'

import { hashPassword, verifyPassword } from '../db/crypto'
import { getDb, mutate } from '../db/store'
import { toPublicUser } from './auth/shared'
import { API } from './constants'
import { errorResponse, validationError } from './errors'
import { requireUser, resolveCaller } from './identity'
import { simulated } from './network'

function profileConflicts(userId: string, email: string, username: string) {
  const others = getDb().users.filter((user) => user.id !== userId)
  const conflicts: Record<string, string> = {}
  if (others.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
    conflicts['email'] = 'Este e-mail já está em uso.'
  }
  if (others.some((user) => user.username.toLowerCase() === username.toLowerCase())) {
    conflicts['username'] = 'Este nome de usuário já está em uso.'
  }
  return conflicts
}

export const profileHandlers = [
  http.get(
    `${API}/profile`,
    simulated(({ request }) => {
      const auth = requireUser(resolveCaller(request))
      if (!auth.ok) return auth.response
      return HttpResponse.json(toPublicUser(auth.user))
    }),
  ),

  http.patch(
    `${API}/profile`,
    simulated(async ({ request }) => {
      const auth = requireUser(resolveCaller(request))
      if (!auth.ok) return auth.response

      const parsed = updateProfileSchema.safeParse(await request.json().catch(() => ({})))
      if (!parsed.success)
        return validationError('Revise os campos destacados.', parsed.error.issues)

      const { email, username } = parsed.data
      const conflicts = profileConflicts(auth.user.id, email, username)
      if (Object.keys(conflicts).length > 0) {
        return errorResponse('CONFLICT', 'Não foi possível salvar o perfil.', conflicts)
      }

      return mutate(() => {
        Object.assign(auth.user, { ...parsed.data, email: email.toLowerCase() })
        return HttpResponse.json(toPublicUser(auth.user))
      })
    }),
  ),

  http.post(
    `${API}/profile/password`,
    simulated(async ({ request }) => {
      const auth = requireUser(resolveCaller(request))
      if (!auth.ok) return auth.response

      const parsed = changePasswordSchema.safeParse(await request.json().catch(() => ({})))
      if (!parsed.success)
        return validationError('Revise os campos destacados.', parsed.error.issues)

      const matches = await verifyPassword(
        parsed.data.currentPassword,
        auth.user.passwordSalt,
        auth.user.passwordHash,
      )
      if (!matches) {
        return errorResponse('VALIDATION_ERROR', 'Senha atual incorreta.', {
          currentPassword: 'Senha atual incorreta.',
        })
      }

      const salt = `${auth.user.id}-salt-${crypto.randomUUID().slice(0, 6)}`
      const hash = await hashPassword(parsed.data.newPassword, salt)
      return mutate(() => {
        auth.user.passwordSalt = salt
        auth.user.passwordHash = hash
        return new HttpResponse(null, { status: 204 })
      })
    }),
  ),
]
