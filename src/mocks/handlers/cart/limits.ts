import type { EditionRecord, NftRecord } from '../../db/types'
import { errorResponse } from '../errors'

export function quantityLimitError(
  nft: NftRecord,
  edition: EditionRecord,
  desired: number,
): Response | null {
  if (edition.available === 0) {
    return errorResponse('CONFLICT', 'Esta edição está esgotada.')
  }
  if (desired > edition.available) {
    return errorResponse('CONFLICT', `Restam apenas ${edition.available} unidades desta edição.`)
  }
  if (desired > nft.maxPerOrder) {
    return errorResponse('CONFLICT', `Limite de ${nft.maxPerOrder} unidades por pedido.`)
  }
  return null
}
