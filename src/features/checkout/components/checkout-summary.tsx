import { Button } from '@/components/ui/button'
import type { Cart } from '@/contracts/cart'
import type { Quote } from '@/contracts/quote'
import type { Wallet } from '@/contracts/wallet'

import { CheckoutItems } from './checkout-items'
import { CheckoutTotals } from './checkout-totals'
import { QuoteAlerts } from './quote-alerts'
import { WalletPicker } from './wallet-picker'

type CheckoutSummaryProps = {
  cart: Cart
  quote: Quote
  wallet: Wallet
  wallets: Wallet[]
  expired: boolean
  acknowledging: boolean
  refreshing: boolean
  submitDisabled: boolean
  onAcknowledge: () => void
  onRefresh: () => void
  onWalletChange: (walletId: string) => void
}

export function CheckoutSummary({
  cart,
  quote,
  wallet,
  wallets,
  expired,
  acknowledging,
  refreshing,
  submitDisabled,
  onAcknowledge,
  onRefresh,
  onWalletChange,
}: CheckoutSummaryProps) {
  return (
    <section aria-labelledby="order-title" className="mt-10 md:mt-0">
      <h2 id="order-title" className="text-cream text-lg leading-6 font-bold">
        Seus NFTs
      </h2>
      <div className="mt-[3px]">
        <QuoteAlerts
          quote={quote}
          expired={expired}
          acknowledging={acknowledging}
          refreshing={refreshing}
          onAcknowledge={onAcknowledge}
          onRefresh={onRefresh}
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
        disabled={submitDisabled}
      >
        Confirmar compra
      </Button>
    </section>
  )
}
