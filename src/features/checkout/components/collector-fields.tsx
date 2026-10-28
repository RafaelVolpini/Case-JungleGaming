import { Controller, type UseFormReturn } from 'react-hook-form'

import { Checkbox } from '@/components/ui/checkbox'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { NETWORK_LABELS, networkSchema } from '@/contracts/common'
import type { CollectorDetails } from '@/contracts/order'
import { ENS_SUFFIXES } from '@/lib/ens'
import { WALLET_TYPE_LABELS, walletTypeSchema, type Wallet } from '@/contracts/wallet'

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
        {(control) => <Input {...control} autoComplete="name" {...register('displayName')} />}
      </Field>
      <Field label="Nome de usuário" required error={errors.username?.message}>
        {(control) => <Input {...control} autoComplete="username" {...register('username')} />}
      </Field>

      <Field label="Rede" required>
        {(field) => (
          <Select value={wallet.network} disabled>
            <SelectTrigger id={field.id} className="disabled:opacity-100">
              <SelectValue placeholder="Selecione uma rede" />
            </SelectTrigger>
            <SelectContent>
              {networkSchema.options.map((network) => (
                <SelectItem key={network} value={network}>
                  {NETWORK_LABELS[network]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </Field>
      <Field label="Nome do perfil" required error={errors.profileName?.message}>
        {(control) => <Input {...control} {...register('profileName')} />}
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
        {(control) => (
          <Input
            {...control}
            aria-label="ENS ou carteira secundária (opcional)"
            placeholder="ENS ou carteira secundária (opcional)"
            {...register('secondaryWallet')}
          />
        )}
      </Field>

      <Field label="Tipo de carteira" required>
        {(field) => (
          <Select value={wallet.walletType} disabled>
            <SelectTrigger id={field.id} className="disabled:opacity-100">
              <SelectValue placeholder="Selecione uma carteira" />
            </SelectTrigger>
            <SelectContent>
              {walletTypeSchema.options.map((type) => (
                <SelectItem key={type} value={type}>
                  {WALLET_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </Field>
      <Field label="Código de indicação" required error={errors.referralCode?.message}>
        {(control) => <Input {...control} {...register('referralCode')} />}
      </Field>

      <Field label="E-mail" required error={errors.email?.message}>
        {(control) => (
          <Input {...control} type="email" autoComplete="email" {...register('email')} />
        )}
      </Field>
      <Field label="Nome ENS" required error={errors.ensSuffix?.message}>
        {(field) => (
          <Controller
            control={control}
            name="ensSuffix"
            render={({ field: { value, onChange } }) => (
              <Select value={value} onValueChange={onChange}>
                <SelectTrigger id={field.id} className="w-[77px] px-2.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENS_SUFFIXES.map((suffix) => (
                    <SelectItem key={suffix} value={suffix}>
                      {suffix}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        )}
      </Field>

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
        {(control) => (
          <Textarea {...control} className="h-[152px] resize-none" {...register('note')} />
        )}
      </Field>
    </div>
  )
}
