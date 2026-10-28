import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { collectorDetailsSchema, type CollectorDetails } from '@/contracts/order'
import type { User } from '@/contracts/session'
import type { Wallet } from '@/contracts/wallet'
import { DEFAULT_ENS_SUFFIX } from '@/lib/ens'

export function useCollectorForm(user: User, wallet: Wallet) {
  return useForm<CollectorDetails>({
    resolver: zodResolver(collectorDetailsSchema),
    defaultValues: {
      displayName: user.displayName,
      username: user.username,
      profileName: wallet.profileName ?? '',
      referralCode: wallet.referralCode ?? '',
      email: user.email,
      ensSuffix: DEFAULT_ENS_SUFFIX,
      secondaryWallet: '',
      note: '',
    },
  })
}
