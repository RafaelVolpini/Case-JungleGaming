import type { DefaultValues } from 'react-hook-form'
import { z } from 'zod'

import { networkSchema } from '@/contracts/common'
import {
  validateWalletAddress,
  walletKindSchema,
  walletTypeSchema,
  type Wallet,
  type WalletKind,
} from '@/contracts/wallet'

export const walletFormSchema = z
  .object({
    kind: walletKindSchema,
    label: z.string().trim().min(1, 'Informe o apelido da carteira'),
    network: networkSchema,
    profileName: z.string().trim().min(1, 'Informe o nome do perfil'),
    address: z.string().trim().min(1, 'Informe o endereço da carteira'),
    linkedReference: z.string().trim().nullable(),
    walletType: walletTypeSchema,
    referralCode: z.string().trim().min(1, 'Informe o código de indicação'),
    ensName: z.string().trim().nullable(),
  })
  .superRefine(validateWalletAddress)
export type WalletFormValues = z.infer<typeof walletFormSchema>

export function walletFormDefaults(
  kind: WalletKind,
  wallet?: Wallet,
): DefaultValues<WalletFormValues> {
  return {
    kind,
    label: wallet?.label ?? '',
    network: wallet?.network,
    profileName: wallet?.profileName ?? '',
    address: wallet?.address ?? '',
    linkedReference: wallet?.linkedReference ?? null,
    walletType: wallet?.walletType,
    referralCode: wallet?.referralCode ?? '',
    ensName: wallet?.ensName ?? null,
  }
}
