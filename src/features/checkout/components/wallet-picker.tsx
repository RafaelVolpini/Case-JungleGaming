import { RadioGroup as RadioGroupPrimitive } from 'radix-ui'

import { NETWORK_LABELS } from '@/contracts/common'
import { WALLET_TYPE_LABELS, type Wallet } from '@/contracts/wallet'
import { shortAddress } from '@/lib/format/address'

import { WalletOptionRing } from './wallet-option-ring'
import { WalletProviderCard } from './wallet-provider-card'

type WalletPickerProps = {
  wallets: Wallet[]
  value: string
  onChange: (walletId: string) => void
}

export function WalletPicker({ wallets, value, onChange }: WalletPickerProps) {
  return (
    <div className="flex flex-col gap-[17px]">
      <WalletProviderCard />
      <RadioGroupPrimitive.Root
        aria-label="Carteira e rede"
        value={value}
        onValueChange={onChange}
        className="flex flex-col gap-[17px]"
      >
        {wallets.map((wallet) => (
          <RadioGroupPrimitive.Item
            key={wallet.id}
            value={wallet.id}
            className="border-input text-cream focus-visible:ring-ring data-[state=checked]:border-primary flex h-11 w-full items-center gap-2.5 rounded-[3px] border px-3 pt-1.5 text-left outline-none transition-colors focus-visible:ring-2"
          >
            <WalletOptionRing checked={wallet.id === value} />
            <span className="min-w-0 flex-1 truncate text-base">
              {WALLET_TYPE_LABELS[wallet.walletType]}
            </span>
            <span className="text-muted-foreground shrink-0 text-xs">
              {NETWORK_LABELS[wallet.network]} · {shortAddress(wallet.address)}
            </span>
          </RadioGroupPrimitive.Item>
        ))}
      </RadioGroupPrimitive.Root>
    </div>
  )
}
