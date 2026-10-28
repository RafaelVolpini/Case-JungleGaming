import { z } from 'zod'

import { walletSchema, type Wallet, type WalletInput } from '@/contracts/wallet'
import { http } from '@/lib/http/client'

export async function fetchWallets(signal?: AbortSignal): Promise<Wallet[]> {
  const { data } = await http.get('/wallets', { signal })
  return z.array(walletSchema).parse(data)
}

export async function createWallet(input: WalletInput): Promise<Wallet> {
  const { data } = await http.post('/wallets', input)
  return walletSchema.parse(data)
}

export async function updateWallet(id: string, input: WalletInput): Promise<Wallet> {
  const { data } = await http.patch(`/wallets/${id}`, input)
  return walletSchema.parse(data)
}

export async function deleteWallet(id: string): Promise<void> {
  await http.delete(`/wallets/${id}`)
}

export async function connectWallet(id: string): Promise<void> {
  await http.post(`/wallets/${id}/connect`)
}

export async function disconnectWallet(id: string): Promise<void> {
  await http.post(`/wallets/${id}/disconnect`)
}
