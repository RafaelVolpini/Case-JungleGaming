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
import { PasswordInput } from '@/components/shared/password-input'
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
    <form noValidate onSubmit={submit} className="w-full">
      <div className="flex flex-col gap-3">
        <Field label="Nome de usuário" error={errors.username?.message} {...HIDDEN_LABEL}>
          {(control) => (
            <Input
              {...control}
              autoComplete="username"
              placeholder="Nome de usuário"
              className="h-[50px] rounded-xl px-4 xl:h-10 xl:rounded"
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
              className="h-[50px] rounded-xl px-4 xl:h-10 xl:rounded"
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
              onToggleVisible={() => setVisible((current) => !current)}
              mobileOnlyToggle
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
        className="mt-[40.5px] h-[60px] w-full rounded-xl text-base xl:mt-6 xl:h-[44.5px] xl:rounded"
      >
        <span className="xl:hidden">Criar perfil</span>
        <span className="hidden xl:inline">Criar conta</span>
      </Button>
      <AuthDivider />
      <SocialLoginButtons spacious />
    </form>
  )
}
