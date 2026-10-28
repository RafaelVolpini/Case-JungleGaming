import { useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'

import { PasswordInput } from '@/components/shared/password-input'
import { Field } from '@/components/ui/field'
import type { ChangePasswordInput } from '@/contracts/session'

import { PAGE_FIELD } from './profile-fields'

const PASSWORD_FIELD = { ...PAGE_FIELD, controlClassName: 'mt-2' }

type Name = keyof ChangePasswordInput

const FIELDS: { name: Name; label: string; autoComplete: string }[] = [
  { name: 'currentPassword', label: 'Senha atual', autoComplete: 'current-password' },
  { name: 'newPassword', label: 'Nova senha', autoComplete: 'new-password' },
  { name: 'confirmNewPassword', label: 'Confirmar nova senha', autoComplete: 'new-password' },
]

function PasswordField({
  form,
  name,
  label,
  autoComplete,
}: (typeof FIELDS)[number] & { form: UseFormReturn<ChangePasswordInput> }) {
  const [visible, setVisible] = useState(false)
  const error = form.formState.errors[name]?.message

  return (
    <Field label={label} error={error} className="md:max-w-[417px]" {...PASSWORD_FIELD}>
      {(field) => (
        <PasswordInput
          {...field}
          visible={visible}
          onToggleVisible={() => setVisible((current) => !current)}
          autoComplete={autoComplete}
          {...form.register(name)}
        />
      )}
    </Field>
  )
}

export function PasswordFields({ form }: { form: UseFormReturn<ChangePasswordInput> }) {
  return (
    <section aria-labelledby="password-title" className="mt-7">
      <h2 id="password-title" className="text-cream text-base leading-6 font-bold">
        Alterar senha
      </h2>
      <div className="mt-[14.5px] flex flex-col gap-[19px]">
        {FIELDS.map((item) => (
          <PasswordField key={item.name} form={form} {...item} />
        ))}
      </div>
    </section>
  )
}
