import type { ReactNode } from 'react'

import { Skeleton } from '@/components/ui/skeleton'

type FilterGroupProps = {
  title: string
  isLoading: boolean
  skeletonRows: number
  children: ReactNode
}

export function FilterGroup({ title, isLoading, skeletonRows, children }: FilterGroupProps) {
  return (
    <section aria-label={title}>
      <h2 className="text-cream text-lg leading-6 font-bold">{title}</h2>
      <ul className="mt-2 flex flex-col">
        {isLoading
          ? Array.from({ length: skeletonRows }, (_, index) => (
              <li key={index} className="flex h-10 items-center px-3">
                <Skeleton className="h-4 w-full" />
              </li>
            ))
          : children}
      </ul>
    </section>
  )
}
