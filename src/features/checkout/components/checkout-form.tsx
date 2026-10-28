import { useState } from 'react'

import type { Cart } from '@/contracts/cart'
import type { Quote } from '@/contracts/quote'
import type { User } from '@/contracts/session'
import type { Wallet } from '@/contracts/wallet'
import { ApiRequestError } from '@/lib/http/errors'
import { useIsExpired } from '@/lib/use-is-expired'

import { useCollectorForm } from '../hooks/use-collector-form'
import { usePlaceOrder } from '../hooks/use-place-order'
import { useAcknowledgeQuote, useQuote } from '../hooks/use-quote'
import { CheckoutSummary } from './checkout-summary'
import { CollectorFields } from './collector-fields'
import { WalletConnectDialog } from './wallet-connect-dialog'

type CheckoutFormProps = {
  user: User
  wallet: Wallet
  wallets: Wallet[]
  cart: Cart
  quote: Quote
  onWalletChange: (walletId: string) => void
}

export function CheckoutForm({
  user,
  wallet,
  wallets,
  cart,
  quote,
  onWalletChange,
}: CheckoutFormProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const quoteQuery = useQuote(wallet)
  const acknowledge = useAcknowledgeQuote(wallet.id)
  const placeOrder = usePlaceOrder()
  const form = useCollectorForm(user, wallet)

  const secondary = wallets.find((candidate) => candidate.kind === 'secondary')
  const primary = wallets.find((candidate) => candidate.kind === 'primary') ?? wallets[0]
  const expired = useIsExpired(quote.expiresAt)
  const blocked = quote.issues.length > 0 || expired

  const confirm = () =>
    placeOrder.mutate({
      quoteId: quote.id,
      walletId: wallet.id,
      network: wallet.network,
      collector: form.getValues(),
    })

  const placeError =
    placeOrder.error instanceof ApiRequestError && placeOrder.error.code !== 'QUOTE_STALE'
      ? placeOrder.error.message
      : null

  function toggleWallet(checked: boolean) {
    const target = checked ? secondary : primary
    if (target) onWalletChange(target.id)
  }

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(() => {
        placeOrder.reset()
        setDialogOpen(true)
      })}
      className="md:grid md:grid-cols-[762px_minmax(0,1fr)] md:gap-x-[33px]"
    >
      <section aria-labelledby="collector-title">
        <h1 id="collector-title" className="text-cream text-xl leading-6 font-bold">
          Perfil do colecionador
        </h1>
        <div className="mt-2">
          <CollectorFields
            form={form}
            wallet={wallet}
            canSwitchWallet={Boolean(secondary && primary)}
            usingOther={wallet.kind === 'secondary'}
            onToggleWallet={toggleWallet}
          />
        </div>
      </section>

      <CheckoutSummary
        cart={cart}
        quote={quote}
        wallet={wallet}
        wallets={wallets}
        expired={expired}
        acknowledging={acknowledge.isPending}
        refreshing={quoteQuery.isFetching}
        submitDisabled={blocked || placeOrder.isPending}
        onAcknowledge={() => acknowledge.mutate(quote)}
        onRefresh={() => void quoteQuery.refetch()}
        onWalletChange={onWalletChange}
      />

      <WalletConnectDialog
        open={dialogOpen}
        wallet={wallet}
        placing={placeOrder.isPending}
        placeError={placeError}
        onOpenChange={setDialogOpen}
        onConfirm={confirm}
      />
    </form>
  )
}
