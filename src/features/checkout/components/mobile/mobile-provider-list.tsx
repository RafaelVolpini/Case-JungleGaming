import { Wallet as WalletIcon } from 'lucide-react'
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui'
import type { ReactNode } from 'react'

import { WALLET_TYPE_LABELS, type WalletType } from '@/contracts/wallet'

import { RadioDot } from './radio-dot'

const PROVIDERS: { type: WalletType; mark: ReactNode }[] = [
  { type: 'walletconnect', mark: 'W' },
  { type: 'metamask', mark: 'M' },
  { type: 'coinbase', mark: <WalletIcon className="size-5" strokeWidth={1.5} /> },
]

type MobileProviderListProps = {
  value: WalletType
  disabled?: boolean
  onChange: (type: WalletType) => void
}

export function MobileProviderList({ value, disabled, onChange }: MobileProviderListProps) {
  return (
    <section aria-labelledby="provider-title" className="mt-3">
      <h2 id="provider-title" className="text-cream text-base leading-6 font-bold">
        Carteira e rede
      </h2>
      <RadioGroupPrimitive.Root
        aria-labelledby="provider-title"
        value={value}
        disabled={disabled}
        onValueChange={(next) => onChange(next as WalletType)}
        className="mt-3 flex flex-col gap-4"
      >
        {PROVIDERS.map(({ type, mark }) => (
          <RadioGroupPrimitive.Item
            key={type}
            value={type}
            className="bg-card focus-visible:ring-ring flex h-[65px] w-full items-center gap-[11px] rounded-[20px] pr-[19px] pl-[14px] text-left outline-none focus-visible:ring-2 disabled:opacity-60"
          >
            <span
              aria-hidden="true"
              className="bg-surface-raised border-[#4a2d1c] text-primary grid size-10 shrink-0 place-items-center rounded-full border text-base font-bold"
            >
              {mark}
            </span>
            <span className="text-cream flex-1 text-[15px]">{WALLET_TYPE_LABELS[type]}</span>
            <RadioDot />
          </RadioGroupPrimitive.Item>
        ))}
      </RadioGroupPrimitive.Root>
    </section>
  )
}
