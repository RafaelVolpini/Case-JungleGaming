import { Link } from '@tanstack/react-router'

import { useAuthActions } from '@/features/auth/hooks/use-auth-actions'
import { cn } from '@/lib/utils'

const PILL =
  'focus-visible:ring-ring shrink-0 rounded-full border px-4 py-2 text-sm whitespace-nowrap outline-none focus-visible:ring-2'
const IDLE =
  'border-input text-primary-light data-[status=active]:border-primary data-[status=active]:bg-primary data-[status=active]:text-primary-foreground data-[status=active]:font-bold'

const LINKS = [
  { to: '/perfil', label: 'Dados do perfil' },
  { to: '/perfil/carteiras', label: 'Carteiras' },
  { to: '/favoritos', label: 'Lista de interesse' },
] as const

export function ProfileMobileNav() {
  const { logout } = useAuthActions()

  return (
    <nav aria-label="Menu do perfil" className="-mx-6 mt-5 flex gap-2 overflow-x-auto px-6 pb-1">
      {LINKS.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          activeOptions={{ exact: true }}
          className={cn(PILL, IDLE)}
          activeProps={{ 'aria-current': 'page' }}
        >
          {link.label}
        </Link>
      ))}
      <button
        type="button"
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
        className={cn(PILL, IDLE)}
      >
        Sair
      </button>
    </nav>
  )
}
