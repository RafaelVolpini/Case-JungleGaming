import { useState } from 'react'

import { Button } from '@/components/ui/button'
import type { User } from '@/contracts/session'
import type { Wallet, WalletKind } from '@/contracts/wallet'

import { useWalletForm } from '../hooks/use-wallet-form'
import { SameAsPrimaryToggle } from './same-as-primary-toggle'
import { WalletFields } from './wallet-fields'
import { WalletSectionHeader } from './wallet-section-header'

type WalletSectionProps = {
  kind: WalletKind
  wallet: Wallet | undefined
  primary: Wallet | undefined
  user: User
}

const ADD_LINK =
  'text-primary-light focus-visible:ring-ring rounded-sm text-base font-bold outline-none hover:underline focus-visible:ring-2'
const FORM_DESCRIPTION =
  'Estas carteiras ficam disponíveis no pagamento e para receber NFTs comprados.'
const COPY = {
  primary: { title: 'Carteira principal', description: FORM_DESCRIPTION },
  secondary: {
    title: 'Carteira secundária',
    description: 'Você ainda não adicionou uma carteira secundária.',
  },
}

export function WalletSection({ kind, wallet, primary, user }: WalletSectionProps) {
  const [adding, setAdding] = useState(false)
  const { form, submit, saving, formError } = useWalletForm(kind, wallet, () => setAdding(false))
  const open = kind === 'primary' || Boolean(wallet) || adding
  const headerId = `${kind}-wallet-title`
  const description = open ? FORM_DESCRIPTION : COPY[kind].description

  return (
    <section aria-labelledby={headerId} className={kind === 'primary' ? undefined : 'mt-7'}>
      <WalletSectionHeader
        id={headerId}
        title={COPY[kind].title}
        description={description}
        descriptionClassName={!open ? 'mt-1.5' : undefined}
        actions={
          <>
            {kind === 'secondary' && (
              <SameAsPrimaryToggle primary={primary} form={form} onCopy={() => setAdding(true)} />
            )}
            {!wallet && (
              <button
                type="button"
                onClick={() => setAdding((current) => !current)}
                className={ADD_LINK}
              >
                {adding ? 'Cancelar' : 'Adicionar'}
              </button>
            )}
          </>
        }
      />
      {open && (
        <form noValidate onSubmit={submit} className="mt-[30px]">
          <WalletFields form={form} user={user} />
          {formError && (
            <p role="alert" className="text-destructive mt-4 text-sm">
              {formError}
            </p>
          )}
          <Button
            type="submit"
            disabled={saving}
            className="mt-8 h-10 w-[131px] rounded px-0 text-sm"
          >
            Salvar carteira
          </Button>
        </form>
      )}
    </section>
  )
}
