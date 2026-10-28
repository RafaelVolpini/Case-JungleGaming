import { getOrCreateCart } from '../../db/carts'
import { resolveCaller } from '../identity'

export function cartFor(request: Request) {
  const caller = resolveCaller(request)
  return getOrCreateCart(caller.user?.id ?? null, caller.visitorId)
}
