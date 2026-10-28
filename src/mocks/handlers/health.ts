import { http, HttpResponse } from 'msw'

import { API } from './constants'

export const healthHandlers = [
  http.get(`${API}/__mock__/ping`, () => HttpResponse.json({ ok: true })),
]
