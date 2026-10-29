import { Link } from '@tanstack/react-router'
import { Heart, House, ScanLine, ShoppingCart, UserRound } from 'lucide-react'

import { UnavailableAction } from '@/components/shared/unavailable-action'
import { useCartCount } from '@/features/cart/hooks/use-cart'

import { useTabBarVisible } from './use-tab-bar-visible'

const TAB = 'text-foreground grid h-full place-items-center'
const ACTIVE = { className: 'text-primary-light' }
const ICON = 'size-[22px] fill-current'

export function MobileTabBar() {
  const count = useCartCount()
  const visible = useTabBarVisible()
  if (!visible) return null

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 mx-auto h-[95px] max-w-[640px] xl:hidden"
    >
      <span
        aria-hidden="true"
        className="bg-card absolute inset-0 rounded-t-[32px] [mask-image:radial-gradient(circle_47.5px_at_50%_0,transparent_47px,#000_47.5px)]"
      />
      <UnavailableAction
        subject="O leitor de QR code"
        aria-label="Escanear QR code"
        className="absolute top-0 left-1/2 z-10 grid size-[65px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-linear-to-b/srgb from-primary-glow/40 to-primary/95 text-white"
      >
        <ScanLine className="size-8" strokeWidth={1.75} aria-hidden="true" />
      </UnavailableAction>
      <div className="absolute inset-x-0 top-0 flex h-[100px] items-start pt-10">
        <div className="ml-1 flex w-[min(168px,calc(50%-27px))]">
          <Link
            to="/"
            aria-label="Início"
            className={`${TAB} h-8 flex-1`}
            activeProps={ACTIVE}
            activeOptions={{ exact: true }}
          >
            <House className={ICON} aria-hidden="true" />
          </Link>
          <Link
            to="/favoritos"
            aria-label="Lista de interesse"
            className={`${TAB} h-8 flex-1`}
            activeProps={ACTIVE}
          >
            <Heart className={ICON} aria-hidden="true" />
          </Link>
        </div>
        <div className="mr-1 ml-auto flex w-[min(168px,calc(50%-27px))]">
          <Link
            to="/carrinho"
            aria-label={`Carrinho, ${count} itens`}
            className={`${TAB} relative h-8 flex-1`}
            activeProps={ACTIVE}
          >
            <ShoppingCart className="size-[22px]" aria-hidden="true" />
            {count > 0 && (
              <span className="bg-primary text-primary-foreground absolute top-0 right-[21px] grid size-4 place-items-center rounded-full text-[10px] font-bold">
                {count}
              </span>
            )}
          </Link>
          <Link
            to="/perfil"
            aria-label="Perfil"
            className={`${TAB} h-8 flex-1`}
            activeProps={ACTIVE}
          >
            <UserRound className={ICON} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </nav>
  )
}
