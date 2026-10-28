import { Link } from '@tanstack/react-router'
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui'

import type { Wallet } from '@/contracts/wallet'

import { MobileWalletCard } from './mobile-wallet-card'

type MobileWalletListProps = {
  wallets: Wallet[]
  value: string
  onChange: (walletId: string) => void
}

export function MobileWalletList({ wallets, value, onChange }: MobileWalletListProps) {
  return (
    <section aria-labelledby="connected-wallet-title">
      <div className="flex items-center justify-between">
        <h2 id="connected-wallet-title" className="text-cream text-base leading-6 font-bold">
          Carteira conectada
        </h2>
        <Link
          to="/perfil/carteiras"
          className="text-primary-light focus-visible:ring-ring rounded-sm text-sm font-bold outline-none hover:underline focus-visible:ring-2"
        >
          Trocar carteira
        </Link>
      </div>
      <RadioGroupPrimitive.Root
        aria-labelledby="connected-wallet-title"
        value={value}
        onValueChange={onChange}
        className="mt-3 flex flex-col gap-5"
      >
        {wallets.map((wallet) => (
          <MobileWalletCard key={wallet.id} wallet={wallet} />
        ))}
      </RadioGroupPrimitive.Root>
    </section>
  )
}
