import type { ReactNode } from 'react'

type EmptyStateProps = { title: string; description?: string; action?: ReactNode }

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="border-border flex flex-col items-center rounded-xl border border-dashed px-6 py-16 text-center">
      <h3 className="text-cream text-lg font-bold">{title}</h3>
      {description && <p className="text-foreground mt-2 max-w-sm text-sm">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
