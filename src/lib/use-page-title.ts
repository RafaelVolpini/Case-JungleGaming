import { useEffect } from 'react'

export const DEFAULT_TITLE = 'Kurio — Marketplace de NFTs'

export function formatPageTitle(title?: string): string {
  return title ? `${title} · Kurio` : DEFAULT_TITLE
}

export function usePageTitle(title?: string): void {
  useEffect(() => {
    document.title = formatPageTitle(title)
  }, [title])
}
