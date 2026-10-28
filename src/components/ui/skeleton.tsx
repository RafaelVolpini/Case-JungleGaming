import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      aria-hidden="true"
      data-slot="skeleton"
      className={cn(
        'bg-surface-raised relative overflow-hidden rounded-md',
        'before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r',
        'before:from-transparent before:via-white/[0.06] before:to-transparent',
        'before:animate-shimmer motion-reduce:before:animate-none',
        className,
      )}
      {...props}
    />
  )
}
