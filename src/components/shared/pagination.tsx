import { ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'

type PaginationProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  windowSize?: number
  className?: string
}

const boxClassName =
  'grid size-[35px] place-items-center rounded-[5px] text-lg transition-colors outline-none focus-visible:ring-ring focus-visible:ring-2'

function visiblePages(page: number, totalPages: number, windowSize: number): number[] {
  const start = Math.min(
    Math.max(1, page - Math.floor((windowSize - 1) / 2)),
    Math.max(1, totalPages - windowSize + 1),
  )
  const count = Math.min(windowSize, totalPages)
  return Array.from({ length: count }, (_, index) => start + index)
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  windowSize = 4,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav aria-label="Paginação" className={cn('flex justify-end gap-2', className)}>
      {visiblePages(page, totalPages, windowSize).map((value) => {
        const active = value === page
        return (
          <button
            key={value}
            type="button"
            aria-label={`Página ${value}`}
            aria-current={active ? 'page' : undefined}
            onClick={() => onPageChange(value)}
            className={cn(
              boxClassName,
              active
                ? 'bg-primary text-primary-foreground font-bold'
                : 'text-cream border border-[#3a2210] bg-background hover:border-primary',
            )}
          >
            {value}
          </button>
        )
      })}
      {page < totalPages && (
        <button
          type="button"
          aria-label="Próxima página"
          onClick={() => onPageChange(page + 1)}
          className={cn(
            boxClassName,
            'text-cream border border-[#3a2210] bg-background hover:border-primary',
          )}
        >
          <ChevronRight className="size-5" />
        </button>
      )}
    </nav>
  )
}
