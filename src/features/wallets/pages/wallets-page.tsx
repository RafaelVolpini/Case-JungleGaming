import { ErrorState } from '@/components/feedback/error-state'
import { FormSkeleton } from '@/components/feedback/form-skeleton'
import { useSession } from '@/features/auth/hooks/use-session'

import { WalletSection } from '../components/wallet-section'
import { useWallets } from '../hooks/use-wallets'
import { usePageTitle } from '@/lib/use-page-title'

export function WalletsPage() {
  usePageTitle('Carteiras')
  const { user } = useSession()
  const wallets = useWallets()

  if (wallets.error) {
    return <ErrorState error={wallets.error} onRetry={() => void wallets.refetch()} />
  }
  if (!user || !wallets.data) return <FormSkeleton rows={5} />

  const primary = wallets.data.find((wallet) => wallet.kind === 'primary')
  const secondary = wallets.data.find((wallet) => wallet.kind === 'secondary')

  return (
    <div className="-mt-1">
      <WalletSection
        key={primary?.id ?? 'primary'}
        kind="primary"
        wallet={primary}
        primary={primary}
        user={user}
      />
      <WalletSection
        key={secondary?.id ?? 'secondary'}
        kind="secondary"
        wallet={secondary}
        primary={primary}
        user={user}
      />
    </div>
  )
}
