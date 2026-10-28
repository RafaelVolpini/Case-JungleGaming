import { Link } from '@tanstack/react-router'
import { EllipsisVertical } from 'lucide-react'
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui'

import { NETWORK_LABELS } from '@/contracts/common'
import type { Wallet } from '@/contracts/wallet'
import { shortAddress } from '@/lib/format/address'

import { RadioDot } from './radio-dot'

function networkLine(wallet: Wallet): string {
  const network = NETWORK_LABELS[wallet.network]
  return wallet.kind === 'primary' ? `Rede principal ${network}` : `Rede ${network}`
}

export function MobileWalletCard({ wallet }: { wallet: Wallet }) {
  return (
    <div className="relative">
      <RadioGroupPrimitive.Item
        value={wallet.id}
        className="bg-card focus-visible:ring-ring flex min-h-[93px] w-full items-center gap-[19px] rounded-[20px] pr-12 pl-[19px] text-left outline-none focus-visible:ring-2"
      >
        <RadioDot />
        <span className="min-w-0 py-[11px]">
          <span className="text-cream block truncate text-base leading-6 font-bold">
            {wallet.label}
          </span>
          <span className="text-foreground block truncate text-sm leading-[22px]">
            {wallet.ensName ?? shortAddress(wallet.address, '…')}
          </span>
          <span className="text-foreground block truncate text-sm leading-[22px]">
            {networkLine(wallet)}
          </span>
        </span>
      </RadioGroupPrimitive.Item>
      <Link
        to="/perfil/carteiras"
        aria-label={`Gerenciar carteira ${wallet.label}`}
        className="text-placeholder focus-visible:ring-ring absolute top-1/2 right-3 grid size-8 -translate-y-1/2 place-items-center rounded-full outline-none focus-visible:ring-2"
      >
        <EllipsisVertical className="size-5" aria-hidden="true" />
      </Link>
    </div>
  )
}
