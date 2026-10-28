import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

import { fieldClassName } from './input'

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(fieldClassName, 'min-h-[120px] resize-y py-3', className)}
      {...props}
    />
  )
}
