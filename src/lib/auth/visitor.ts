import { readStorage, writeStorage } from '@/lib/storage'

const VISITOR_KEY = 'kurio:visitor-id'

export function getVisitorId(): string {
  const existing = readStorage(VISITOR_KEY)
  if (existing) return existing
  const created = `visitor-${crypto.randomUUID()}`
  writeStorage(VISITOR_KEY, created)
  return created
}
