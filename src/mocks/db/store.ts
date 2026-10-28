import type { MockDb } from './types'

export const SCHEMA_VERSION = 1
export const STORAGE_KEY = 'kurio:mock-db'

export type DbEvent =
  | { type: 'nft.updated'; nftId: string }
  | { type: 'order.updated'; orderId: string; ownerId: string }

type DbListener = (event: DbEvent) => void

let db: MockDb | null = null
const listeners = new Set<DbListener>()

export function onDbEvent(listener: DbListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function emitDbEvent(event: DbEvent): void {
  for (const listener of listeners) {
    try {
      listener(event)
    } catch (error) {
      console.error('[mock-db] listener failed', error)
    }
  }
}

export function getDb(): MockDb {
  if (!db) {
    throw new Error('[mock-db] not initialised — call initializeDb() before starting the worker')
  }
  return db
}

export function isDbReady(): boolean {
  return db !== null
}

export function nextVersion(): number {
  const current = getDb()
  current.sequence += 1
  return current.sequence
}

function readPersisted(): MockDb | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<MockDb>
    if (parsed.schemaVersion !== SCHEMA_VERSION) return null
    return parsed as MockDb
  } catch {
    return null
  }
}

export function persist(): void {
  if (!db) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
    return
  }
}

export function mutate<T>(fn: (current: MockDb) => T, events: DbEvent[] = []): T {
  const result = fn(getDb())
  persist()
  for (const event of events) emitDbEvent(event)
  return result
}

export function mutateWith<T>(fn: (current: MockDb) => { result: T; events: DbEvent[] }): T {
  const { result, events } = fn(getDb())
  persist()
  for (const event of events) emitDbEvent(event)
  return result
}

export function setDb(next: MockDb): void {
  db = next
  persist()
}

export function resetDb(seed: () => MockDb): MockDb {
  const fresh = seed()
  setDb(fresh)
  return fresh
}

export function loadOrSeed(seed: () => MockDb): { db: MockDb; seeded: boolean } {
  const persisted = readPersisted()
  if (persisted) {
    db = persisted
    return { db: persisted, seeded: false }
  }
  const fresh = seed()
  setDb(fresh)
  return { db: fresh, seeded: true }
}
