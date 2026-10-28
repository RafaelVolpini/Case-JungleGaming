import { NETWORK_LABELS } from '@/contracts/common'
import { shortAddress } from '@/lib/format/address'

import type { NftArt, NftRecord } from './records/catalog'

const ROYALTY_PERCENT = 5

const ART_ALT: Record<NftArt, string> = {
  emerald: 'macaco marrom de óculos redondos e jaqueta esportiva verde',
  sage: 'gorila cinza de chapéu verde e moletom roxo',
  ivory: 'macaco de pelagem escura com brinco dourado e blazer creme sobre gola alta verde',
  golden: 'macaco dourado de fones de ouvido verdes e jaqueta creme',
}

export function artAlt(nft: NftRecord): string {
  return `${nft.name} — ${ART_ALT[nft.art]}`
}

export function shortDescription(nft: NftRecord): string {
  const network = NETWORK_LABELS[nft.network]
  return `Um colecionável digital finalizado à mão da coleção ${nft.series}, verificado na ${network}, com arte desbloqueável e acesso para colecionadores.`
}

export function storyParagraphs(nft: NftRecord): string[] {
  const network = NETWORK_LABELS[nft.network]
  return [
    `${nft.name} é uma obra digital finalizada à mão da coleção ${nft.series}. Cada atributo fica armazenado nos metadados do token e verificado na ${network}. A obra explora identidade, movimento e luz em um mundo digital sem fronteiras.`,
    `A propriedade inclui a arte em alta resolução, lançamentos exclusivos para colecionadores e um registro permanente de procedência registrada na rede. O criador recebe ${ROYALTY_PERCENT}% de direitos autorais nas vendas secundárias, apoiando novos trabalhos e lançamentos da comunidade.`,
  ]
}

export function networkNote(nft: NftRecord): string {
  return `Cunhado na ${NETWORK_LABELS[nft.network]} com procedência imutável e metadados armazenados no IPFS.`
}

export function contractNote(nft: NftRecord): string {
  const standard = nft.network === 'solana' ? 'Metaplex' : 'ERC-721'
  return `${shortAddress(nft.contractAddress)} • Contrato inteligente ${standard} verificado.`
}

export function royaltyNote(): string {
  return `Direitos autorais do criador: ${ROYALTY_PERCENT}% nas vendas secundárias, pagos automaticamente pelos mercados compatíveis.`
}
