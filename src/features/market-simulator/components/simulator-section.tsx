import type { ReactNode } from 'react'

export function SimulatorSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-primary/25 border-t pt-3">
      <h3 className="text-cream mb-2 text-xs font-bold tracking-wide uppercase">{title}</h3>
      {children}
    </section>
  )
}
