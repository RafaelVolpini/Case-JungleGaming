import { Link } from '@tanstack/react-router'
import { Heart, House, ScanLine, ShoppingCart, UserRound } from 'lucide-react'

import { useCartCount } from '@/features/cart/hooks/use-cart'

const tabClassName = 'text-foreground/50 grid h-14 flex-1 place-items-center'
const activeProps = { className: 'text-primary' }

export function MobileTabBar() {
  const count = useCartCount()

  return (
    <nav
      aria-label="Navegação principal"
      className="bg-card fixed inset-x-0 bottom-0 z-40 flex items-end rounded-t-3xl pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <Link
        to="/"
        aria-label="Início"
        className={tabClassName}
        activeProps={activeProps}
        activeOptions={{ exact: true }}
      >
        <House className="size-6" />
      </Link>
      <Link
        to="/favoritos"
        aria-label="Favoritos"
        className={tabClassName}
        activeProps={activeProps}
      >
        <Heart className="size-6" />
      </Link>
      <Link
        to="/carrinho"
        aria-label={`Carrinho, ${count} itens`}
        className="bg-primary/40 border-primary text-primary -mt-7 mb-3 grid size-14 place-items-center rounded-full border-2"
      >
        <ScanLine className="size-6" />
      </Link>
      <Link to="/carrinho" aria-label="Carrinho" className={tabClassName} activeProps={activeProps}>
        <ShoppingCart className="size-6" />
      </Link>
      <Link to="/perfil" aria-label="Perfil" className={tabClassName} activeProps={activeProps}>
        <UserRound className="size-6" />
      </Link>
    </nav>
  )
}
