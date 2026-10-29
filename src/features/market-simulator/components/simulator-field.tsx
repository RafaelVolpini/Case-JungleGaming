import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

export const SIMULATOR_CONTROL =
  'bg-background border-input text-cream focus-visible:ring-ring h-9 w-full rounded-md border px-2 text-sm outline-none focus-visible:ring-2'

type SimulatorSelectProps = ComponentProps<'select'> & { label: string }

export function SimulatorSelect({ label, className, children, ...props }: SimulatorSelectProps) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="text-foreground">{label}</span>
      <select className={cn(SIMULATOR_CONTROL, className)} {...props}>
        {children}
      </select>
    </label>
  )
}
