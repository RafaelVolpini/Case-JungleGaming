import type { Page } from '@playwright/test'

export const USERS = {
  ana: { email: 'ana@kurio.test', password: 'kurio-ana-2026', name: 'Ana Ribeiro' },
  bruno: { email: 'bruno@kurio.test', password: 'kurio-bruno-2026', name: 'Bruno Carvalho' },
} as const

type ApiOptions = {
  method?: string
  body?: unknown
  auth?: boolean
  headers?: Record<string, string>
}

export async function api<T = unknown>(
  page: Page,
  path: string,
  { method = 'GET', body, auth = false, headers: extra = {} }: ApiOptions = {},
): Promise<{ status: number; body: T }> {
  return page.evaluate(
    async ([url, verb, payload, withAuth, extraHeaders]) => {
      const headers: Record<string, string> = {
        'content-type': 'application/json',
        ...(extraHeaders as Record<string, string>),
      }
      const visitor = localStorage.getItem('kurio:visitor-id')
      if (visitor) headers['x-visitor-id'] = visitor
      const token = localStorage.getItem('kurio:session-token')
      if (withAuth && token) headers['authorization'] = `Bearer ${token}`
      const response = await fetch(url as string, {
        method: verb as string,
        headers,
        body: payload === undefined ? undefined : JSON.stringify(payload),
      })
      const text = await response.text()
      return { status: response.status, body: text ? JSON.parse(text) : null }
    },
    [path, method, body, auth, extra] as const,
  ) as Promise<{ status: number; body: T }>
}

export const mock = {
  scenario: (page: Page, patch: Record<string, unknown>) =>
    api(page, '/api/__mock__/scenario', { method: 'POST', body: patch }),
  reset: (page: Page) => api(page, '/api/__mock__/reset', { method: 'POST', body: {} }),
  expireSessions: (page: Page) => api(page, '/api/__mock__/expire-sessions', { method: 'POST' }),
  changeNft: (
    page: Page,
    slug: string,
    change: { priceEth?: string; edition?: string; available?: number },
  ) => api(page, `/api/__mock__/nfts/${slug}`, { method: 'POST', body: change }),
  emit: (page: Page, event: string, payload: unknown) =>
    api(page, '/api/__mock__/socket/emit', { method: 'POST', body: { event, payload } }),
  dropSocket: (page: Page) => api(page, '/api/__mock__/socket/drop', { method: 'POST' }),
  socketClients: async (page: Page) =>
    (await api<{ clients: number }>(page, '/api/__mock__/socket')).body.clients,
}
