import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

export const fieldClassName = [
  'border-input placeholder:text-muted-foreground w-full min-w-0 rounded-lg border bg-transparent',
  'text-foreground px-4 text-sm transition-colors outline-none md:text-base',
  'focus-visible:border-primary focus-visible:ring-primary focus-visible:ring-1',
  'aria-invalid:border-destructive aria-invalid:ring-destructive aria-invalid:ring-1',
  'disabled:cursor-not-allowed disabled:opacity-50',
].join(' ')

export function Input({ className, type = 'text', ...props }: ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(fieldClassName, 'h-[52px] md:h-12', className)}
      {...props}
    />
  )
}
