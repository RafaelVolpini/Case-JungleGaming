import type { Network } from '@/contracts/common'
import type { WalletKind, WalletType } from '@/contracts/wallet'

export type UserRecord = {
  id: string
  displayName: string
  username: string
  email: string
  passwordHash: string
  passwordSalt: string
  ensName: string | null
  avatarEmoji: string
  createdAt: string
}

export type SessionRecord = {
  token: string
  userId: string
  expiresAt: string
}

export type WalletRecord = {
  id: string
  ownerId: string
  kind: WalletKind
  label: string
  address: string
  network: Network
  walletType: WalletType
  ensName: string | null
  profileName: string | null
  referralCode: string | null
  createdAt: string
}

