import { http, HttpResponse } from 'msw'

import { createSeed } from '../db/seed'
import { getDb, persist, resetDb } from '../db/store'
import { getScenario, loadScenario, resetScenario, setScenario } from '../scenarios/state'
import type { ScenarioConfig } from '../scenarios/types'
import { forgetNftEvents } from '../socket/event-log'
import { API } from './constants'

export const devHandlers = [
  http.post(`${API}/__mock__/reset`, async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as {
      scenario?: Partial<ScenarioConfig>
      keepScenario?: boolean
    }

    resetDb(createSeed)
    forgetNftEvents()

    if (!body.keepScenario) resetScenario()
    if (body.scenario) setScenario(body.scenario)

    return HttpResponse.json({
      ok: true,
      scenario: getScenario(),
      nfts: getDb().nfts.length,
    })
  }),

  http.get(`${API}/__mock__/scenario`, () => HttpResponse.json(getScenario())),

  http.post(`${API}/__mock__/expire-sessions`, () => {
    const db = getDb()
    const expiredAt = new Date(Date.now() - 1000).toISOString()
    for (const session of db.sessions) session.expiresAt = expiredAt
    persist()
    return HttpResponse.json({ ok: true, expired: db.sessions.length })
  }),

  http.post(`${API}/__mock__/scenario`, async ({ request }) => {
    const patch = (await request.json().catch(() => ({}))) as Partial<ScenarioConfig>
    return HttpResponse.json(setScenario(patch))
  }),

  http.post(`${API}/__mock__/scenario/reload`, () => HttpResponse.json(loadScenario())),

  http.get(`${API}/__mock__/state`, () => {
    const db = getDb()
    return HttpResponse.json({
      schemaVersion: db.schemaVersion,
      sequence: db.sequence,
      counts: {
        nfts: db.nfts.length,
        users: db.users.length,
        sessions: db.sessions.length,
        carts: db.carts.length,
        orders: db.orders.length,
        quotes: db.quotes.length,
        idempotency: db.idempotency.length,
      },
    })
  }),
]
