import axios, { isAxiosError, type AxiosResponse } from 'axios'

import { notifySessionExpired } from '@/lib/auth/expiry'
import { readToken } from '@/lib/auth/token'
import { getVisitorId } from '@/lib/auth/visitor'

import { ApiRequestError, NETWORK_MESSAGE, toApiRequestError } from './errors'
import { notifyApiUnreachable } from './unreachable'

const REQUEST_TIMEOUT_MS = 8000
const CREDENTIAL_ROUTES = ['/auth/login', '/auth/register']

export const http = axios.create({ baseURL: '/api', timeout: REQUEST_TIMEOUT_MS })

http.interceptors.request.use((config) => {
  const token = readToken()
  if (token) config.headers.set('Authorization', `Bearer ${token}`)
  config.headers.set('x-visitor-id', getVisitorId())
  return config
})

function carriedCredentials(error: unknown): boolean {
  return isAxiosError(error) && Boolean(error.config?.headers?.has('Authorization'))
}

function isCredentialRoute(error: unknown): boolean {
  const url = isAxiosError(error) ? (error.config?.url ?? '') : ''
  return CREDENTIAL_ROUTES.some((route) => url.startsWith(route))
}

function rejectHtml(response: AxiosResponse): AxiosResponse {
  const type = String(response.headers['content-type'] ?? '')
  if (!type.includes('text/html')) return response
  notifyApiUnreachable()
  throw new ApiRequestError({ kind: 'network', message: NETWORK_MESSAGE })
}

http.interceptors.response.use(rejectHtml, (error: unknown) => {
  const failure = toApiRequestError(error)
  if (
    failure.code === 'UNAUTHENTICATED' &&
    carriedCredentials(error) &&
    !isCredentialRoute(error)
  ) {
    notifySessionExpired()
  }
  return Promise.reject(failure)
})
