import type { UseFormReturn } from 'react-hook-form'

import { Checkbox } from '@/components/ui/checkbox'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { NETWORK_LABELS, networkSchema } from '@/contracts/common'
import type { CollectorDetails } from '@/contracts/order'
import { WALLET_TYPE_LABELS, walletTypeSchema, type Wallet } from '@/contracts/wallet'

import { EnsSuffixField } from './ens-suffix-field'
import { LockedSelectField } from './locked-select-field'

type CollectorFieldsProps = {
  form: UseFormReturn<CollectorDetails>
  wallet: Wallet
  canSwitchWallet: boolean
  usingOther: boolean
  onToggleWallet: (checked: boolean) => void
}

export function CollectorFields({
  form,
  wallet,
  canSwitchWallet,
  usingOther,
  onToggleWallet,
}: CollectorFieldsProps) {
  const { register, control, formState } = form
  const { errors } = formState

  return (
    <div className="grid gap-x-[25px] gap-y-[13px] md:grid-cols-2">
      <Field label="Nome de exibição" required error={errors.displayName?.message}>
        {(field) => <Input {...field} autoComplete="name" {...register('displayName')} />}
      </Field>
      <Field label="Nome de usuário" required error={errors.username?.message}>
        {(field) => <Input {...field} autoComplete="username" {...register('username')} />}
      </Field>

      <LockedSelectField
        label="Rede"
        placeholder="Selecione uma rede"
        value={wallet.network}
        options={networkSchema.options}
        labels={NETWORK_LABELS}
      />
      <Field label="Nome do perfil" required error={errors.profileName?.message}>
        {(field) => <Input {...field} {...register('profileName')} />}
      </Field>

      <Field label="Endereço da carteira" required>
        {(field) => (
          <Input
            id={field.id}
            readOnly
            value={wallet.address}
            placeholder="Endereço 0x da carteira"
            className="read-only:text-foreground"
          />
        )}
      </Field>
      <Field label="ENS ou carteira secundária (opcional)" className="md:[&>label]:invisible">
        {(field) => (
          <Input
            {...field}
            aria-label="ENS ou carteira secundária (opcional)"
            placeholder="ENS ou carteira secundária (opcional)"
            {...register('secondaryWallet')}
          />
        )}
      </Field>

      <LockedSelectField
        label="Tipo de carteira"
        placeholder="Selecione uma carteira"
        value={wallet.walletType}
        options={walletTypeSchema.options}
        labels={WALLET_TYPE_LABELS}
      />
      <Field label="Código de indicação" required error={errors.referralCode?.message}>
        {(field) => <Input {...field} {...register('referralCode')} />}
      </Field>

      <Field label="E-mail" required error={errors.email?.message}>
        {(field) => <Input {...field} type="email" autoComplete="email" {...register('email')} />}
      </Field>
      <EnsSuffixField control={control} error={errors.ensSuffix?.message} />

      <label className="text-cream col-span-full mt-[9.5px] flex items-start gap-2 text-[15px] leading-6">
        <Checkbox
          className="mt-[1.5px] size-[15px] border-[1.5px]"
          checked={usingOther}
          disabled={!canSwitchWallet}
          onCheckedChange={(checked) => onToggleWallet(checked === true)}
        />
        Usar outra carteira?
      </label>

      <Field
        label="Observação do colecionador (opcional)"
        error={errors.note?.message}
        labelClassName="text-cream text-[15px]"
        controlClassName="mt-[8.5px]"
        className="col-span-full mt-1 md:max-w-[350px]"
      >
        {(field) => <Textarea {...field} className="h-[152px] resize-none" {...register('note')} />}
      </Field>
    </div>
  )
}
