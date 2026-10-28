import type { Network } from '@/contracts/common'

const EXPLORER_NAMES: Record<Network, string> = {
  ethereum: 'Etherscan',
  polygon: 'Polygonscan',
  solana: 'Solscan',
}

export function explorerName(network: Network): string {
  return EXPLORER_NAMES[network]
}
