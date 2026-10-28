import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { UnavailableAction } from '@/components/shared/unavailable-action'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { loginSchema, type LoginInput } from '@/contracts/session'

import { useAuthActions } from '../hooks/use-auth-actions'
import { applyApiErrors } from '../lib/apply-api-errors'
import { AuthDivider } from './auth-divider'
import { PasswordInput } from '@/components/shared/password-input'
import { SocialLoginButtons } from './social-login-buttons'

export function LoginForm() {
  const { login } = useAuthActions()
  const [visible, setVisible] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const submit = handleSubmit((values) => {
    setFormError(null)
    login.mutate(values, { onError: (error) => setFormError(applyApiErrors(error, setError)) })
  })

  return (
    <form
      noValidate
      onSubmit={submit}
      className="mx-auto mt-[24.5px] w-full max-w-[340px] px-4 md:px-0"
    >
      <div className="flex flex-col gap-3">
        <Field
          label="E-mail"
          labelClassName="sr-only"
          controlClassName="mt-0"
          error={errors.email?.message}
        >
          {(control) => (
            <Input
              {...control}
              type="email"
              autoComplete="email"
              placeholder="contato@email.com"
              className="px-4"
              {...register('email')}
            />
          )}
        </Field>
        <Field
          label="Senha"
          labelClassName="sr-only"
          controlClassName="mt-0"
          error={errors.password?.message}
        >
          {(control) => (
            <PasswordInput
              {...control}
              visible={visible}
              onToggleVisible={() => setVisible((current) => !current)}
              autoComplete="current-password"
              placeholder="Senha"
              {...register('password')}
            />
          )}
        </Field>
      </div>
      <UnavailableAction
        subject="A recuperação de senha"
        className="text-primary-light mt-2 ml-auto block text-sm leading-6 hover:underline"
      >
        Esqueceu a senha?
      </UnavailableAction>
      {formError && (
        <p role="alert" className="text-destructive mt-3 text-sm">
          {formError}
        </p>
      )}
      <Button
        type="submit"
        disabled={login.isPending}
        className="mt-5 h-[44.5px] w-full text-base md:rounded"
      >
        Entrar
      </Button>
      <AuthDivider />
      <SocialLoginButtons />
    </form>
  )
}
