import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import type { Cart } from '@/contracts/cart'
import { collectorDetailsSchema, type CollectorDetails } from '@/contracts/order'
import type { Quote } from '@/contracts/quote'
import type { User } from '@/contracts/session'
import type { Wallet } from '@/contracts/wallet'
import { ApiRequestError } from '@/lib/http/errors'
import { useIsExpired } from '@/lib/use-is-expired'

import { usePlaceOrder } from '../hooks/use-place-order'
import { useAcknowledgeQuote, useQuote } from '../hooks/use-quote'
import { CheckoutItems } from './checkout-items'
import { CheckoutTotals } from './checkout-totals'
import { CollectorFields } from './collector-fields'
import { QuoteAlerts } from './quote-alerts'
import { WalletConnectDialog } from './wallet-connect-dialog'
import { WalletPicker } from './wallet-picker'

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
  const form = useForm<CollectorDetails>({
    resolver: zodResolver(collectorDetailsSchema),
    defaultValues: {
      displayName: user.displayName,
      username: user.username,
      profileName: wallet.profileName ?? '',
      referralCode: wallet.referralCode ?? '',
      email: user.email,
      ensSuffix: '.eth',
      secondaryWallet: '',
      note: '',
    },
  })

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

      <section aria-labelledby="order-title" className="mt-10 md:mt-0">
        <h2 id="order-title" className="text-cream text-lg leading-6 font-bold">
          Seus NFTs
        </h2>
        <div className="mt-[3px]">
          <QuoteAlerts
            quote={quote}
            expired={expired}
            acknowledging={acknowledge.isPending}
            refreshing={quoteQuery.isFetching}
            onAcknowledge={() => acknowledge.mutate(quote)}
            onRefresh={() => void quoteQuery.refetch()}
          />
          <CheckoutItems items={cart.items} />
          <CheckoutTotals totals={quote.totals} />
        </div>
        <h2 className="text-cream mt-1 text-center text-lg leading-6 font-bold">Carteira e rede</h2>
        <div className="mt-4">
          <WalletPicker wallets={wallets} value={wallet.id} onChange={onWalletChange} />
        </div>
        <Button
          type="submit"
          className="mt-6 h-11 w-full rounded-lg text-base"
          disabled={blocked || placeOrder.isPending}
        >
          Confirmar compra
        </Button>
      </section>

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
