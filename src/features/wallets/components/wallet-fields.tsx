import { Controller, type UseFormReturn } from 'react-hook-form'

import { EnsNameField } from '@/components/shared/ens-name-field'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { NETWORK_LABELS, networkSchema } from '@/contracts/common'
import type { User } from '@/contracts/session'
import { WALLET_TYPE_LABELS, walletTypeSchema } from '@/contracts/wallet'

import type { WalletFormValues } from '../lib/wallet-form'

const FIELD = { labelClassName: 'text-[15px]/6', controlClassName: 'mt-0' }
const BLANK_LABEL = { labelClassName: 'sr-only', controlClassName: 'mt-6' }

type WalletFieldsProps = { form: UseFormReturn<WalletFormValues>; user: User }

export function WalletFields({ form, user }: WalletFieldsProps) {
  const { register, control, formState } = form
  const { errors } = formState

  return (
    <div className="grid gap-x-7 gap-y-[25px] md:grid-cols-2">
      <Field label="Nome de exibição" required {...FIELD}>
        {(field) => <Input {...field} readOnly value={user.displayName} className="px-4" />}
      </Field>
      <Field label="Apelido da carteira" required error={errors.label?.message} {...FIELD}>
        {(field) => <Input {...field} className="px-4" {...register('label')} />}
      </Field>

      <Field label="Rede" required error={errors.network?.message} {...FIELD}>
        {(field) => (
          <Controller
            control={control}
            name="network"
            render={({ field: { value, onChange } }) => (
              <Select value={value ?? ''} onValueChange={onChange}>
                <SelectTrigger id={field.id} aria-invalid={field['aria-invalid']}>
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
          />
        )}
      </Field>
      <Field label="Nome do perfil" required error={errors.profileName?.message} {...FIELD}>
        {(field) => <Input {...field} className="px-4" {...register('profileName')} />}
      </Field>

      <Field label="Endereço da carteira" required error={errors.address?.message} {...FIELD}>
        {(field) => (
          <Input
            {...field}
            autoComplete="off"
            spellCheck={false}
            placeholder="Endereço 0x da carteira"
            className="px-4"
            {...register('address')}
          />
        )}
      </Field>
      <Field label="ENS ou carteira secundária (opcional)" {...BLANK_LABEL}>
        {(field) => (
          <Input
            {...field}
            autoComplete="off"
            placeholder="ENS ou carteira secundária (opcional)"
            className="px-4"
            {...register('linkedReference', { setValueAs: (value: string) => value || null })}
          />
        )}
      </Field>

      <Field label="Tipo de carteira" required error={errors.walletType?.message} {...FIELD}>
        {(field) => (
          <Controller
            control={control}
            name="walletType"
            render={({ field: { value, onChange } }) => (
              <Select value={value ?? ''} onValueChange={onChange}>
                <SelectTrigger id={field.id} aria-invalid={field['aria-invalid']}>
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
          />
        )}
      </Field>
      <Field label="Código de indicação" required error={errors.referralCode?.message} {...FIELD}>
        {(field) => <Input {...field} className="px-4" {...register('referralCode')} />}
      </Field>

      <Field label="E-mail" required {...FIELD}>
        {(field) => <Input {...field} readOnly type="email" value={user.email} className="px-4" />}
      </Field>
      <Field label="Nome ENS" required error={errors.ensName?.message} {...FIELD}>
        {(field) => (
          <Controller
            control={control}
            name="ensName"
            render={({ field: { value, onChange } }) => (
              <EnsNameField
                id={field.id}
                value={value}
                onChange={onChange}
                invalid={Boolean(field['aria-invalid'])}
                describedBy={field['aria-describedby']}
              />
            )}
          />
        )}
      </Field>
    </div>
  )
}
