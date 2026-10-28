import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

export const badgeVariants = cva('inline-flex items-center font-bold whitespace-nowrap', {
  variants: {
    variant: {
      rare: 'bg-primary text-primary-foreground rounded-sm px-2 py-1 text-[10px] tracking-wider uppercase',
      wallet: 'bg-card text-primary rounded-sm px-2 py-1 text-[10px] tracking-wider uppercase',
      count:
        'bg-primary text-primary-foreground min-w-4 justify-center rounded-full px-1 text-[10px] leading-4',
    },
  },
  defaultVariants: { variant: 'rare' },
})

type BadgeProps = ComponentProps<'span'> & VariantProps<typeof badgeVariants>

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
}
