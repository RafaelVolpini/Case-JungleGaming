import { Controller, type UseFormReturn } from 'react-hook-form'

import { EnsNameField } from '@/components/shared/ens-name-field'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

import type { ProfileFormValues } from '../lib/profile-form'
import { PAGE_FIELD } from '../lib/field-props'
import { AvatarField } from './avatar-field'

type ProfileFieldsProps = { form: UseFormReturn<ProfileFormValues>; hasWallet: boolean }

export function ProfileFields({ form, hasWallet }: ProfileFieldsProps) {
  const { register, control, formState } = form
  const { errors } = formState

  return (
    <div className="grid gap-x-7 gap-y-[25px] md:grid-cols-2">
      <Field label="Nome de exibição" required error={errors.displayName?.message} {...PAGE_FIELD}>
        {(field) => <Input {...field} className="px-4" {...register('displayName')} />}
      </Field>
      <Field label="Nome de usuário" required error={errors.username?.message} {...PAGE_FIELD}>
        {(field) => (
          <Input {...field} autoComplete="username" className="px-4" {...register('username')} />
        )}
      </Field>
      <Field label="E-mail" required error={errors.email?.message} {...PAGE_FIELD}>
        {(field) => (
          <Input
            {...field}
            type="email"
            autoComplete="email"
            className="px-4"
            {...register('email')}
          />
        )}
      </Field>
      <Field label="Nome ENS" required error={errors.ensName?.message} {...PAGE_FIELD}>
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
      <Field
        label="Apelido da carteira"
        required
        error={errors.walletLabel?.message}
        {...PAGE_FIELD}
      >
        {(field) => (
          <Input {...field} disabled={!hasWallet} className="px-4" {...register('walletLabel')} />
        )}
      </Field>
      <Controller
        control={control}
        name="avatarEmoji"
        render={({ field: { value, onChange } }) => (
          <AvatarField value={value} onChange={onChange} />
        )}
      />
    </div>
  )
}
