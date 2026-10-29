import { TrendingDown, TrendingUp, TriangleAlert } from 'lucide-react'

import { useSession } from '@/features/auth/hooks/use-session'
import { formatEth } from '@/lib/money/eth'
import { cn } from '@/lib/utils'

import { useCartNote } from '../lib/cart-change-notes'

type CartChangeNoteProps = { itemId: string; className?: string }

export function CartChangeNote({ itemId, className }: CartChangeNoteProps) {
  const { scope } = useSession()
  const note = useCartNote(scope, itemId)
  if (!note) return null

  const Icon =
    note.kind === 'availability'
      ? TriangleAlert
      : note.direction === 'up'
        ? TrendingUp
        : TrendingDown
  const text =
    note.kind === 'availability'
      ? `Restam ${note.available}`
      : `${note.direction === 'up' ? 'Subiu' : 'Caiu'}, era ${formatEth(note.from)}`

  return (
    <p
      data-testid="cart-change-note"
      className={cn('text-warning flex items-center gap-1 text-xs leading-4', className)}
    >
      <Icon className="size-3 shrink-0" aria-hidden="true" />
      {text}
    </p>
  )
}
