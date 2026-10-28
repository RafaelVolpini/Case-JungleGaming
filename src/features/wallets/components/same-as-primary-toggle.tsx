import { useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'

import type { Wallet } from '@/contracts/wallet'

import { walletFormDefaults, type WalletFormValues } from '../lib/wallet-form'

type SameAsPrimaryToggleProps = {
  primary: Wallet | undefined
  form: UseFormReturn<WalletFormValues>
  onCopy: () => void
}

export function SameAsPrimaryToggle({ primary, form, onCopy }: SameAsPrimaryToggleProps) {
  const [checked, setChecked] = useState(false)

  function toggle() {
    if (!primary) return
    const next = !checked
    setChecked(next)
    if (!next) return
    onCopy()
    const { network, walletType, profileName, referralCode, ensName, linkedReference } =
      walletFormDefaults('secondary', primary)
    form.reset({
      ...form.getValues(),
      network,
      walletType,
      profileName,
      referralCode,
      ensName,
      linkedReference,
    })
  }

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-disabled={!primary}
      title={primary ? undefined : 'Cadastre a carteira principal primeiro'}
      onClick={toggle}
      className="text-foreground focus-visible:ring-ring flex items-center gap-[9px] rounded-sm text-sm outline-none focus-visible:ring-2"
    >
      <span
        aria-hidden="true"
        className="border-primary grid size-[15px] place-items-center rounded-full border-[1.5px]"
      >
        {checked && <span className="bg-primary size-2 rounded-full" />}
      </span>
      Igual à carteira principal
    </button>
  )
}
