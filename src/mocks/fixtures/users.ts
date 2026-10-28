import type { Network } from '@/contracts/common'
import type { WalletKind, WalletType } from '@/contracts/wallet'

export type WalletSeed = {
  id: string
  kind: WalletKind
  label: string
  address: string
  network: Network
  walletType: WalletType
  ensName: string | null
  profileName: string | null
  referralCode: string | null
}

export type UserSeed = {
  id: string
  displayName: string
  username: string
  email: string
  password: string
  ensName: string | null
  avatarEmoji: string
  createdAt: string
  favoriteSlugs: string[]
  wallets: WalletSeed[]
}

export const USER_SEEDS: UserSeed[] = [
  {
    id: 'user-ana',
    displayName: 'Ana Ribeiro',
    username: 'anaribeiro',
    email: 'ana@kurio.test',
    password: 'kurio-ana-2026',
    ensName: 'anaribeiro.eth',
    avatarEmoji: '🦧',
    createdAt: '2026-02-11T14:20:00.000Z',
    favoriteSlugs: ['azure-signal-417'],
    wallets: [
      {
        id: 'wallet-ana-primary',
        kind: 'primary',
        label: 'Principal',
        address: '0x8f2a19c4b7d35e6180a9c4f2b3d81e7a5c0d9b42',
        network: 'ethereum',
        walletType: 'metamask',
        ensName: 'anaribeiro.eth',
        profileName: 'Ana Ribeiro',
        referralCode: 'KURIO-ANA',
      },
      {
        id: 'wallet-ana-secondary',
        kind: 'secondary',
        label: 'Reserva',
        address: '0x3c7e52d81a9f04b6e2d7c381f5a0b94e6d2c8f17',
        network: 'polygon',
        walletType: 'walletconnect',
        ensName: null,
        profileName: 'Ana Ribeiro',
        referralCode: null,
      },
    ],
  },
  {
    id: 'user-bruno',
    displayName: 'Bruno Tavares',
    username: 'btavares',
    email: 'bruno@kurio.test',
    password: 'kurio-bruno-2026',
    ensName: null,
    avatarEmoji: '🐒',
    createdAt: '2026-05-03T09:05:00.000Z',
    favoriteSlugs: [],
    wallets: [
      {
        id: 'wallet-bruno-primary',
        kind: 'primary',
        label: 'Carteira de trabalho',
        address: '7xKXtg2CW3qVafBHtGrFKXWKLPpZcbUV9Qe8mTnLuqRa',
        network: 'solana',
        walletType: 'coinbase',
        ensName: null,
        profileName: 'Bruno Tavares',
        referralCode: null,
      },
    ],
  },
]

export const NETWORK_FEES: Record<Network, string> = {
  ethereum: '0.0042',
  polygon: '0.0008',
  solana: '0.0003',
}
