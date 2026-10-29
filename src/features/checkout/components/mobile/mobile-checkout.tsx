import { useState } from 'react'
import { toast } from 'sonner'

import type { Quote } from '@/contracts/quote'
import type { User } from '@/contracts/session'
import type { Wallet, WalletType } from '@/contracts/wallet'
import { useSaveWallet } from '@/features/wallets/hooks/use-wallet-mutations'
import { walletToInput } from '@/features/wallets/lib/wallet-input'
import { ApiRequestError, errorMessage } from '@/lib/http/errors'
import { useIsExpired } from '@/lib/use-is-expired'
import { formatEth } from '@/lib/money/eth'

import { usePlaceOrder } from '../../hooks/use-place-order'
import { useAcknowledgeQuote, useQuote } from '../../hooks/use-quote'
import { collectorFromProfile } from '../../lib/collector-from-profile'
import { QuoteAlerts } from '../quote-alerts'
import { WalletConnectDialog } from '../wallet-connect-dialog'
import { MobileProviderList } from './mobile-provider-list'
import { MobileWalletList } from './mobile-wallet-list'

type MobileCheckoutProps = {
  user: User
  wallet: Wallet
  wallets: Wallet[]
  quote: Quote
  onWalletChange: (walletId: string) => void
}

export function MobileCheckout({
  user,
  wallet,
  wallets,
  quote,
  onWalletChange,
}: MobileCheckoutProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const quoteQuery = useQuote(wallet)
  const acknowledge = useAcknowledgeQuote(wallet.id)
  const placeOrder = usePlaceOrder()
  const saveWallet = useSaveWallet()
  const expired = useIsExpired(quote.expiresAt)
  const blocked = quote.issues.length > 0 || expired

  const placeError =
    placeOrder.error instanceof ApiRequestError && placeOrder.error.code !== 'QUOTE_STALE'
      ? placeOrder.error.message
      : null

  const confirm = () =>
    placeOrder.mutate({
      quoteId: quote.id,
      walletId: wallet.id,
      network: wallet.network,
      collector: collectorFromProfile(user, wallet),
    })

  const changeProvider = (walletType: WalletType) =>
    saveWallet.mutate(
      { id: wallet.id, input: walletToInput(wallet, { walletType }) },
      { onError: (failure) => toast.error(errorMessage(failure)) },
    )

  return (
    <div className="pb-[130px]">
      <QuoteAlerts
        quote={quote}
        expired={expired}
        acknowledging={acknowledge.isPending}
        refreshing={quoteQuery.isFetching}
        onAcknowledge={() => acknowledge.mutate(quote)}
        onRefresh={() => void quoteQuery.refetch()}
      />
      <MobileWalletList wallets={wallets} value={wallet.id} onChange={onWalletChange} />
      <MobileProviderList
        value={wallet.walletType}
        disabled={saveWallet.isPending}
        onChange={changeProvider}
      />
      <p className="mt-2.5 flex items-center justify-end gap-[19px] pr-0.5">
        <span className="text-cream text-lg leading-6 font-bold">Total:</span>
        <span
          className="text-primary-light text-xl leading-7 font-bold"
          data-testid="checkout-total"
        >
          {formatEth(quote.totals.totalEth)}
        </span>
      </p>
      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[640px] px-6 pb-[33px]">
        <button
          type="button"
          onClick={() => {
            placeOrder.reset()
            setDialogOpen(true)
          }}
          disabled={blocked || placeOrder.isPending}
          className="text-background focus-visible:ring-ring h-[60px] w-full rounded-full bg-gradient-to-br from-[#cc874b] to-[#b47845] text-base font-bold outline-none focus-visible:ring-2 disabled:opacity-50"
        >
          Confirmar compra
        </button>
      </div>
      <WalletConnectDialog
        open={dialogOpen}
        wallet={wallet}
        placing={placeOrder.isPending}
        placeError={placeError}
        onOpenChange={setDialogOpen}
        onConfirm={confirm}
      />
    </div>
  )
}
