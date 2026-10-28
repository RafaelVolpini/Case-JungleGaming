import { delay, HttpResponse, type PathParams } from 'msw'

import { getScenario } from '../scenarios/state'
import { countRequest, isInScope, resolveDelay } from '../scenarios/timing'
import { errorResponse } from './errors'

const TRANSIENT_FAILURE = 'Falha temporária no servidor. Tente novamente.'

export type RouteInfo = { request: Request; params: PathParams }

export async function simulateNetwork(request: Request): Promise<Response | null> {
  const config = getScenario()
  const { pathname } = new URL(request.url)

  await delay(resolveDelay(config))

  if (config.failure === 'none' || !isInScope(config, pathname)) return null

  switch (config.failure) {
    case 'offline':
      return HttpResponse.error()
    case 'server-error':
      return errorResponse('SERVER_ERROR', TRANSIENT_FAILURE)
    case 'timeout':
      await delay('infinite')
      return null
    case 'intermittent':
      return countRequest(pathname) % config.failEvery === 0
        ? errorResponse('SERVER_ERROR', TRANSIENT_FAILURE)
        : null
    case 'unauthorized':
      return errorResponse('UNAUTHENTICATED', 'Sua sessão expirou. Entre novamente.')
    default:
      return null
  }
}

export function simulated(resolver: (info: RouteInfo) => Response | Promise<Response>) {
  return async (info: RouteInfo): Promise<Response> =>
    (await simulateNetwork(info.request)) ?? resolver(info)
}
