import { NETWORK_LABELS } from '@/contracts/common'
import type { Edition, NftDetail } from '@/contracts/nft'

export function mobileSummary(nft: NftDetail, edition: Edition | undefined): string {
  const label = edition ? ` ${edition.label}` : ''
  return `Um colecionável digital${label} finalizado à mão da coleção Kurio Editions, verificado na ${NETWORK_LABELS[nft.network]}.`
}
