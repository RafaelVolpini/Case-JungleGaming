import { Link } from '@tanstack/react-router'

import { cn } from '@/lib/utils'

const COPY = {
  login: { prompt: 'Novo na Kurio?', action: 'Crie uma conta', to: '/criar-conta' },
  register: { prompt: 'Já tem uma conta?', action: 'Entre', to: '/entrar' },
} as const

type AuthSwitchPromptProps = {
  mode: 'login' | 'register'
  redirect?: string
  className?: string
}

export function AuthSwitchPrompt({ mode, redirect, className }: AuthSwitchPromptProps) {
  const copy = COPY[mode]

  return (
    <p className={cn('text-foreground text-center text-base leading-6', className)}>
      {copy.prompt}{' '}
      <Link
        to={copy.to}
        search={redirect ? { redirect } : {}}
        className="text-primary-light focus-visible:ring-ring rounded-sm font-bold underline underline-offset-4 outline-none focus-visible:ring-2"
      >
        {copy.action}
      </Link>
    </p>
  )
}
