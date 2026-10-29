import { ErrorState } from '@/components/feedback/error-state'
import { FormSkeleton } from '@/components/feedback/form-skeleton'
import { useSession } from '@/features/auth/hooks/use-session'
import { useWallets } from '@/features/wallets/hooks/use-wallets'

import { ProfileForm } from '../components/profile-form'
import { usePageTitle } from '@/lib/use-page-title'

export function ProfilePage() {
  usePageTitle('Perfil')
  const { user } = useSession()
  const wallets = useWallets()

  if (wallets.error) {
    return <ErrorState error={wallets.error} onRetry={() => void wallets.refetch()} />
  }
  if (!user || !wallets.data) return <FormSkeleton rows={3} />

  const primary = wallets.data.find((wallet) => wallet.kind === 'primary')
  return <ProfileForm key={user.id} user={user} primary={primary} />
}
