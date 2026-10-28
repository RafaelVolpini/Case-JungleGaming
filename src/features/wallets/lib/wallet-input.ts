import type { Wallet, WalletInput } from '@/contracts/wallet'

export function walletToInput(wallet: Wallet, patch: Partial<WalletInput> = {}): WalletInput {
  return {
    kind: wallet.kind,
    label: wallet.label,
    address: wallet.address,
    network: wallet.network,
    walletType: wallet.walletType,
    ensName: wallet.ensName,
    profileName: wallet.profileName,
    referralCode: wallet.referralCode,
    linkedReference: wallet.linkedReference,
    ...patch,
  }
}
