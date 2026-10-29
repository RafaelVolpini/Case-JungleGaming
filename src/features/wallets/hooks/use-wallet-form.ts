import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from '@/lib/toast'

import type { Wallet, WalletKind } from '@/contracts/wallet'
import { applyApiErrors } from '@/features/auth/lib/apply-api-errors'

import { walletFormDefaults, walletFormSchema, type WalletFormValues } from '../lib/wallet-form'
import { useSaveWallet } from './use-wallet-mutations'

const SAVED_MESSAGE: Record<WalletKind, string> = {
  primary: 'Carteira principal salva.',
  secondary: 'Carteira secundária salva.',
}

export function useWalletForm(kind: WalletKind, wallet: Wallet | undefined, onSaved: () => void) {
  const saveWallet = useSaveWallet()
  const [formError, setFormError] = useState<string | null>(null)
  const form = useForm<WalletFormValues>({
    resolver: zodResolver(walletFormSchema),
    defaultValues: walletFormDefaults(kind, wallet),
  })

  const submit = form.handleSubmit((values) => {
    setFormError(null)
    saveWallet.mutate(
      { id: wallet?.id, input: values },
      {
        onSuccess: () => {
          toast.success(SAVED_MESSAGE[kind])
          onSaved()
        },
        onError: (error) => setFormError(applyApiErrors(error, form.setError)),
      },
    )
  })

  return { form, submit, saving: saveWallet.isPending, formError }
}
