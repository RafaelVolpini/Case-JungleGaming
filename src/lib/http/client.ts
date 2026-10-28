import axios, { isAxiosError } from 'axios'

import { notifySessionExpired } from '@/lib/auth/expiry'
import { readToken } from '@/lib/auth/token'
import { getVisitorId } from '@/lib/auth/visitor'

import { toApiRequestError } from './errors'

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

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const failure = toApiRequestError(error)
    if (
      failure.code === 'UNAUTHENTICATED' &&
      carriedCredentials(error) &&
      !isCredentialRoute(error)
    ) {
      notifySessionExpired()
    }
    return Promise.reject(failure)
  },
)
