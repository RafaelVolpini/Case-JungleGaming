import { Link } from '@tanstack/react-router'
import { ShoppingCart } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { useCartCount } from '@/features/cart/hooks/use-cart'

export function CartLink() {
  const count = useCartCount()
  const label = count === 1 ? 'Carrinho, 1 item' : `Carrinho, ${count} itens`

  return (
    <Link
      to="/carrinho"
      aria-label={label}
      className="text-cream hover:text-primary-light relative grid size-6 place-items-center transition-colors"
    >
      <ShoppingCart className="size-6" strokeWidth={2.2} />
      {count > 0 && (
        <Badge variant="count" className="absolute top-0 left-4 size-4 p-0" aria-hidden="true">
          {count}
        </Badge>
      )}
    </Link>
  )
}
