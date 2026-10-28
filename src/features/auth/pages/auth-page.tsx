import { useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'

import { cn } from '@/lib/utils'
import { sanitizeRedirect } from '@/lib/url/safe-redirect'

import { AuthIntro } from '../components/auth-intro'
import { AuthModal } from '../components/auth-modal'
import { AuthTabs } from '../components/auth-tabs'
import { LoginForm } from '../components/login-form'
import { RegisterForm } from '../components/register-form'
import { useSession } from '../hooks/use-session'

type AuthPageProps = {
  mode: 'login' | 'register'
  redirect?: string
  expired?: boolean
}

const COPY = {
  login: {
    title: 'Entrar',
    intro: 'Entre para gerenciar sua carteira, coleção e perfil de criador.',
    height: 'md:top-[160px] md:h-[600px]',
  },
  register: {
    title: 'Criar conta',
    intro: 'Crie seu perfil de colecionador e conecte uma carteira quando quiser.',
    height: 'md:top-[158px] md:h-[656px]',
  },
}

export function AuthPage({ mode, redirect, expired = false }: AuthPageProps) {
  const router = useRouter()
  const { isAuthenticated } = useSession()
  const target = sanitizeRedirect(redirect)
  const copy = COPY[mode]

  useEffect(() => {
    if (isAuthenticated) router.history.replace(target)
  }, [isAuthenticated, target, router])

  return (
    <AuthModal
      title={copy.title}
      onClose={() => router.history.replace('/')}
      className={cn(copy.height)}
    >
      <AuthTabs mode={mode} redirect={redirect} />
      <AuthIntro>{copy.intro}</AuthIntro>
      {expired && mode === 'login' && (
        <p role="status" className="text-primary-light mt-3 text-center text-sm">
          Sua sessão expirou. Entre novamente para continuar.
        </p>
      )}
      {mode === 'login' ? <LoginForm /> : <RegisterForm />}
    </AuthModal>
  )
}
