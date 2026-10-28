import type { CollectorDetails } from '@/contracts/order'
import type { User } from '@/contracts/session'
import type { Wallet } from '@/contracts/wallet'
import { DEFAULT_ENS_SUFFIX } from '@/lib/ens'

const MISSING_REFERRAL = 'sem-indicacao'

export function collectorFromProfile(user: User, wallet: Wallet): CollectorDetails {
  return {
    displayName: user.displayName,
    username: user.username,
    profileName: wallet.profileName || user.displayName,
    referralCode: wallet.referralCode || MISSING_REFERRAL,
    email: user.email,
    ensSuffix: DEFAULT_ENS_SUFFIX,
    secondaryWallet: '',
    note: '',
  }
}
