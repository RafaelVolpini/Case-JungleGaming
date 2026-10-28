import {
  BadgeDollarSign,
  Heart,
  HardDriveDownload,
  LogOut,
  MapPin,
  ShoppingCart,
  TriangleAlert,
  User,
} from 'lucide-react'

import { useAuthActions } from '@/features/auth/hooks/use-auth-actions'

import { ProfileLink, ProfileUnavailable } from './profile-menu-item'

export function ProfileSidebar() {
  const { logout } = useAuthActions()

  return (
    <aside className="bg-card pt-3 pb-2">
      <h2 className="text-cream px-2.5 text-lg leading-7 font-bold">Meu perfil</h2>
      <nav aria-label="Menu do perfil" className="mt-[3px]">
        <ProfileLink to="/perfil" icon={User} label="Dados do perfil" />
        <ProfileLink to="/perfil/carteiras" icon={MapPin} label="Carteiras" />
        <ProfileUnavailable icon={ShoppingCart} label="Atividade" />
        <ProfileLink to="/favoritos" icon={Heart} label="Lista de interesse" />
        <ProfileUnavailable icon={BadgeDollarSign} label="Ofertas" />
        <ProfileUnavailable icon={HardDriveDownload} label="Arquivos baixados" />
        <ProfileUnavailable icon={TriangleAlert} label="Suporte" />
        <div className="border-primary/40 border-t">
          <button
            type="button"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="text-primary-light focus-visible:ring-ring flex h-10 w-full items-center gap-3 pl-[17px] text-[15px] font-bold outline-none focus-visible:ring-2 focus-visible:ring-inset"
          >
            <LogOut className="size-[18px]" strokeWidth={1.5} aria-hidden="true" />
            Sair
          </button>
        </div>
      </nav>
    </aside>
  )
}
