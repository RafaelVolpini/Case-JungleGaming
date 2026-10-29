import { useId, type ReactNode } from 'react'

import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export type FieldControlProps = {
  id: string
  'aria-invalid': true | undefined
  'aria-describedby': string | undefined
  'aria-required': true | undefined
}

export function controlAria(control: FieldControlProps) {
  return {
    'aria-invalid': control['aria-invalid'],
    'aria-describedby': control['aria-describedby'],
    'aria-required': control['aria-required'],
  }
}

type FieldProps = {
  label: string
  required?: boolean
  error?: string
  hint?: string
  className?: string
  labelClassName?: string
  controlClassName?: string
  children: (control: FieldControlProps) => ReactNode
}

export function Field({
  label,
  required,
  error,
  hint,
  className,
  labelClassName,
  controlClassName,
  children,
}: FieldProps) {
  const id = useId()
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ')

  return (
    <div className={cn('flex flex-col', className)}>
      <Label htmlFor={id} required={required} className={cn('text-base leading-6', labelClassName)}>
        {label}
      </Label>
      <div className={cn('mt-1', controlClassName)}>
        {children({
          id,
          'aria-invalid': error ? true : undefined,
          'aria-describedby': describedBy || undefined,
          'aria-required': required ? true : undefined,
        })}
      </div>
      {hint && !error && (
        <p id={hintId} className="text-muted-foreground mt-1 text-xs">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-destructive mt-1 text-xs">
          {error}
        </p>
      )}
    </div>
  )
}
