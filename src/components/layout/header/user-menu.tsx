import { Link } from '@tanstack/react-router'
import { ChevronDown, Heart, LogOut, UserRound, Wallet } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { User } from '@/contracts/session'
import { useAuthActions } from '@/features/auth/hooks/use-auth-actions'

export function UserMenu({ user }: { user: User }) {
  const { logout } = useAuthActions()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="border-primary text-primary hover:bg-primary hover:text-primary-foreground ml-2.5 flex h-[35px] items-center gap-2 rounded-md border px-3 text-sm font-bold transition-colors">
        <span aria-hidden="true">{user.avatarEmoji}</span>
        <span className="max-w-[110px] truncate">{user.displayName}</span>
        <ChevronDown className="size-4" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-muted-foreground truncate font-normal">
          {user.email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/perfil">
            <UserRound /> Meu perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/perfil/carteiras">
            <Wallet /> Carteiras
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/favoritos">
            <Heart /> Lista de interesse
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => logout.mutate()}>
          <LogOut /> Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
