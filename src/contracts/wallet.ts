import { z } from 'zod'

import { networkSchema, timestampSchema } from './common'

export const walletTypeSchema = z.enum(['metamask', 'walletconnect', 'coinbase'])
export type WalletType = z.infer<typeof walletTypeSchema>

export const WALLET_TYPE_LABELS: Record<WalletType, string> = {
  metamask: 'MetaMask',
  walletconnect: 'WalletConnect',
  coinbase: 'Coinbase Wallet',
}

/** The Figma models exactly two slots: "Carteira principal" and "secundária". */
export const walletKindSchema = z.enum(['primary', 'secondary'])
export type WalletKind = z.infer<typeof walletKindSchema>

export const walletSchema = z.object({
  id: z.string(),
  kind: walletKindSchema,
  /** "Apelida da carteira" in the Figma. */
  label: z.string(),
  address: z.string(),
  network: networkSchema,
  walletType: walletTypeSchema,
  ensName: z.string().nullable(),
  profileName: z.string().nullable(),
  referralCode: z.string().nullable(),
  createdAt: timestampSchema,
})
export type Wallet = z.infer<typeof walletSchema>

/** Address format differs per chain; validating generically would accept junk. */
const ADDRESS_PATTERNS = {
  ethereum: /^0x[a-fA-F0-9]{40}$/,
  polygon: /^0x[a-fA-F0-9]{40}$/,
  solana: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
} as const

export const walletInputSchema = z
  .object({
    kind: walletKindSchema,
    label: z.string().trim().min(1, 'Informe o apelido da carteira'),
    address: z.string().trim().min(1, 'Informe o endereço da carteira'),
    network: networkSchema,
    walletType: walletTypeSchema,
    ensName: z.string().trim().nullable().default(null),
    profileName: z.string().trim().nullable().default(null),
    referralCode: z.string().trim().nullable().default(null),
  })
  .superRefine((data, ctx) => {
    if (!ADDRESS_PATTERNS[data.network].test(data.address)) {
      ctx.addIssue({
        code: 'custom',
        path: ['address'],
        message:
          data.network === 'solana'
            ? 'Endereço Solana inválido (32-44 caracteres base58)'
            : 'Endereço inválido (deve começar com 0x e ter 40 caracteres hex)',
      })
    }
  })
export type WalletInput = z.infer<typeof walletInputSchema>
