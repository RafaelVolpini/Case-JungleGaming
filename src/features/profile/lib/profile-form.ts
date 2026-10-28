import { z } from 'zod'

import { updateProfileSchema, type User } from '@/contracts/session'

export function profileFormSchema(hasWallet: boolean) {
  return updateProfileSchema.extend({
    walletLabel: hasWallet ? z.string().trim().min(1, 'Informe o apelido da carteira') : z.string(),
  })
}
export type ProfileFormValues = z.infer<ReturnType<typeof profileFormSchema>>

export function profileDefaults(user: User, walletLabel: string): ProfileFormValues {
  return {
    displayName: user.displayName,
    username: user.username,
    email: user.email,
    ensName: user.ensName,
    avatarEmoji: user.avatarEmoji,
    walletLabel,
  }
}
