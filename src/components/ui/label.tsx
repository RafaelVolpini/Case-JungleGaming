import { Label as LabelPrimitive } from 'radix-ui'
import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

type LabelProps = ComponentProps<typeof LabelPrimitive.Root> & { required?: boolean }

export function Label({ className, required, children, ...props }: LabelProps) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn('text-foreground flex items-center gap-1 text-sm select-none', className)}
      {...props}
    >
      {children}
      {required && (
        <span aria-hidden="true" className="text-primary">
          *
        </span>
      )}
    </LabelPrimitive.Root>
  )
}
