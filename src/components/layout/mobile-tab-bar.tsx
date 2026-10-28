import { Link } from '@tanstack/react-router'
import { Heart, House, ScanLine, ShoppingCart, UserRound } from 'lucide-react'

import { UnavailableAction } from '@/components/shared/unavailable-action'
import { useCartCount } from '@/features/cart/hooks/use-cart'

const TAB = 'text-foreground grid h-full place-items-center'
const ACTIVE = { className: 'text-primary-light' }
const ICON = 'size-[22px] fill-current'

export function MobileTabBar() {
  const count = useCartCount()

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 h-[95px] md:hidden"
    >
      <span
        aria-hidden="true"
        className="bg-card absolute inset-0 rounded-t-[32px] [mask-image:radial-gradient(circle_47.5px_at_50%_0,transparent_47px,#000_47.5px)]"
      />
      <UnavailableAction
        subject="O leitor de QR code"
        aria-label="Escanear QR code"
        className="absolute top-0 left-1/2 grid size-[65px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gradient-to-b from-[#d99a62]/90 to-[#b9773f]/90 text-white"
      >
        <ScanLine className="size-8" strokeWidth={1.75} aria-hidden="true" />
      </UnavailableAction>
      <div className="absolute inset-x-0 top-0 flex h-[100px] items-start pt-10">
        <div className="ml-2.5 flex w-36">
          <Link
            to="/"
            aria-label="Início"
            className={`${TAB} h-8 w-[72px]`}
            activeProps={ACTIVE}
            activeOptions={{ exact: true }}
          >
            <House className={ICON} aria-hidden="true" />
          </Link>
          <Link
            to="/favoritos"
            aria-label="Lista de interesse"
            className={`${TAB} h-8 w-[72px]`}
            activeProps={ACTIVE}
          >
            <Heart className={ICON} aria-hidden="true" />
          </Link>
        </div>
        <div className="ml-auto mr-[19px] flex w-[125px]">
          <Link
            to="/carrinho"
            aria-label={`Carrinho, ${count} itens`}
            className={`${TAB} relative h-8 w-[62.5px]`}
            activeProps={ACTIVE}
          >
            <ShoppingCart className="size-[22px]" aria-hidden="true" />
            {count > 0 && (
              <span className="bg-primary text-primary-foreground absolute top-0 right-2.5 grid size-4 place-items-center rounded-full text-[10px] font-bold">
                {count}
              </span>
            )}
          </Link>
          <Link
            to="/perfil"
            aria-label="Perfil"
            className={`${TAB} h-8 w-[62.5px]`}
            activeProps={ACTIVE}
          >
            <UserRound className={ICON} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </nav>
  )
}
