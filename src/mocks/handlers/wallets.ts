import { http, HttpResponse } from 'msw'

import { walletInputSchema, type WalletInput } from '@/contracts/wallet'

import { projectWallet, walletsOf } from '../db/wallets'
import { getDb, mutate } from '../db/store'
import type { WalletRecord } from '../db/types'
import { API } from './constants'
import { errorResponse, validationError } from './errors'
import { requireUser, resolveCaller } from './identity'
import { simulated } from './network'

const KIND_LABEL = { primary: 'principal', secondary: 'secundária' } as const

function findConflicts(
  ownerId: string,
  input: WalletInput,
  ignoreId?: string,
): Record<string, string> {
  const others = walletsOf(ownerId).filter((wallet) => wallet.id !== ignoreId)
  const conflicts: Record<string, string> = {}
  if (others.some((wallet) => wallet.kind === input.kind)) {
    conflicts['kind'] = `Você já possui uma carteira ${KIND_LABEL[input.kind]}.`
  }
  if (others.some((wallet) => wallet.address.toLowerCase() === input.address.toLowerCase())) {
    conflicts['address'] = 'Este endereço já está cadastrado em outra carteira.'
  }
  return conflicts
}

async function parseInput(request: Request) {
  return walletInputSchema.safeParse(await request.json().catch(() => ({})))
}

function ownedWallet(ownerId: string, id: string): WalletRecord | undefined {
  return getDb().wallets.find((candidate) => candidate.id === id && candidate.ownerId === ownerId)
}

export const walletHandlers = [
  http.get(
    `${API}/wallets`,
    simulated(({ request }) => {
      const auth = requireUser(resolveCaller(request))
      if (!auth.ok) return auth.response
      return HttpResponse.json(walletsOf(auth.user.id).map(projectWallet))
    }),
  ),

  http.post(
    `${API}/wallets`,
    simulated(async ({ request }) => {
      const auth = requireUser(resolveCaller(request))
      if (!auth.ok) return auth.response

      const parsed = await parseInput(request)
      if (!parsed.success)
        return validationError('Revise os campos destacados.', parsed.error.issues)

      const conflicts = findConflicts(auth.user.id, parsed.data)
      if (Object.keys(conflicts).length > 0) {
        return errorResponse('CONFLICT', 'Não foi possível salvar a carteira.', conflicts)
      }

      const wallet: WalletRecord = {
        ...parsed.data,
        id: `wallet-${crypto.randomUUID().slice(0, 8)}`,
        ownerId: auth.user.id,
        createdAt: new Date().toISOString(),
      }
      return mutate(() => {
        getDb().wallets.push(wallet)
        return HttpResponse.json(projectWallet(wallet), { status: 201 })
      })
    }),
  ),

  http.patch(
    `${API}/wallets/:id`,
    simulated(async ({ request, params }) => {
      const auth = requireUser(resolveCaller(request))
      if (!auth.ok) return auth.response

      const wallet = ownedWallet(auth.user.id, String(params['id']))
      if (!wallet) return errorResponse('NOT_FOUND', 'Carteira não encontrada.')

      const parsed = await parseInput(request)
      if (!parsed.success)
        return validationError('Revise os campos destacados.', parsed.error.issues)

      const conflicts = findConflicts(auth.user.id, parsed.data, wallet.id)
      if (Object.keys(conflicts).length > 0) {
        return errorResponse('CONFLICT', 'Não foi possível salvar a carteira.', conflicts)
      }

      return mutate(() => {
        Object.assign(wallet, parsed.data)
        return HttpResponse.json(projectWallet(wallet))
      })
    }),
  ),

  http.delete(
    `${API}/wallets/:id`,
    simulated(({ request, params }) => {
      const auth = requireUser(resolveCaller(request))
      if (!auth.ok) return auth.response

      const id = String(params['id'])
      if (!ownedWallet(auth.user.id, id)) {
        return errorResponse('NOT_FOUND', 'Carteira não encontrada.')
      }
      return mutate(() => {
        getDb().wallets = getDb().wallets.filter((candidate) => candidate.id !== id)
        return new HttpResponse(null, { status: 204 })
      })
    }),
  ),
]
