import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { registerSchema, type RegisterInput } from '@/contracts/session'

import { useAuthActions } from '../hooks/use-auth-actions'
import { applyApiErrors } from '../lib/apply-api-errors'
import { AuthDivider } from './auth-divider'
import { PasswordInput } from './password-input'
import { SocialLoginButtons } from './social-login-buttons'

const HIDDEN_LABEL = { labelClassName: 'sr-only', controlClassName: 'mt-0' }

export function RegisterForm() {
  const { register: createAccount } = useAuthActions()
  const [visible, setVisible] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', email: '', password: '', confirmPassword: '' },
  })

  const submit = handleSubmit((values) => {
    setFormError(null)
    createAccount.mutate(values, {
      onError: (error) => setFormError(applyApiErrors(error, setError)),
    })
  })

  return (
    <form
      noValidate
      onSubmit={submit}
      className="mx-auto mt-[24.5px] w-full max-w-[340px] px-4 md:px-0"
    >
      <div className="flex flex-col gap-3">
        <Field label="Nome de usuário" error={errors.username?.message} {...HIDDEN_LABEL}>
          {(control) => (
            <Input
              {...control}
              autoComplete="username"
              placeholder="Nome de usuário"
              className="px-4"
              {...register('username')}
            />
          )}
        </Field>
        <Field label="E-mail" error={errors.email?.message} {...HIDDEN_LABEL}>
          {(control) => (
            <Input
              {...control}
              type="email"
              autoComplete="email"
              placeholder="Digite seu e-mail"
              className="px-4"
              {...register('email')}
            />
          )}
        </Field>
        <Field label="Senha" error={errors.password?.message} {...HIDDEN_LABEL}>
          {(control) => (
            <PasswordInput
              {...control}
              visible={visible}
              onToggleVisible={() => setVisible((current) => !current)}
              autoComplete="new-password"
              placeholder="Senha"
              {...register('password')}
            />
          )}
        </Field>
        <Field label="Confirmar senha" error={errors.confirmPassword?.message} {...HIDDEN_LABEL}>
          {(control) => (
            <PasswordInput
              {...control}
              visible={visible}
              autoComplete="new-password"
              placeholder="Confirmar senha"
              {...register('confirmPassword')}
            />
          )}
        </Field>
      </div>
      {formError && (
        <p role="alert" className="text-destructive mt-3 text-sm">
          {formError}
        </p>
      )}
      <Button
        type="submit"
        disabled={createAccount.isPending}
        className="mt-6 h-[44.5px] w-full text-base md:rounded"
      >
        Criar conta
      </Button>
      <AuthDivider />
      <SocialLoginButtons spacious />
    </form>
  )
}
