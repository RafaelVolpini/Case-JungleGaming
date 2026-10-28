import type { MockDb } from './types'

/**
 * The simulated backend's state container.
 *
 * Persistence exists so a refresh keeps the cart, session and orders — the
 * challenge tests that explicitly. The schema version guards against a stale
 * payload from an older build: anything that does not match is discarded and
 * reseeded rather than patched, because a half-migrated mock is worse than a
 * fresh one.
 */

export const SCHEMA_VERSION = 1
export const STORAGE_KEY = 'kurio:mock-db'

/**
 * Signals emitted whenever a record changes. The Socket.IO gateway subscribes
 * and builds its payload by reading the same store the REST handlers read, so
 * the two can never disagree about what the data is — which is exactly what
 * "mudanças nos dados simulados devem ser refletidas tanto nas respostas REST
 * quanto nos eventos correspondentes" asks for.
 */
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

/** Next value of the global sequence. Every mutated record takes one. */
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
    // Private mode, cleared storage, or a corrupt payload — reseed instead.
    return null
  }
}

export function persist(): void {
  if (!db) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
    // Storage may be unavailable or full. The in-memory copy still works;
    // only durability across refresh is lost.
  }
}

/**
 * Applies a change and persists it. Every write goes through here so that no
 * mutation can skip persistence, and so events are emitted after the state is
 * already consistent.
 */
export function mutate<T>(fn: (current: MockDb) => T, events: DbEvent[] = []): T {
  const result = fn(getDb())
  persist()
  for (const event of events) emitDbEvent(event)
  return result
}

/**
 * Like `mutate`, but the mutation itself decides which events to emit — used
 * where the events depend on what actually changed (for example, only the NFTs
 * whose stock a purchase consumed).
 */
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

/** Restores the seeded scenario. Exposed to the UI and to the E2E suite. */
export function resetDb(seed: () => MockDb): MockDb {
  const fresh = seed()
  setDb(fresh)
  return fresh
}

/**
 * Loads persisted state when it is usable, otherwise seeds. Returns whether it
 * had to seed, which the dev tooling surfaces so a stale cart is never
 * mistaken for a bug in the handlers.
 */
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
