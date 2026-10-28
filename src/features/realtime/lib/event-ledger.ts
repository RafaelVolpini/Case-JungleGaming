const MAX_REMEMBERED_EVENTS = 500

type EventIdentity = { eventId: string; resource: string; id: string; version: number }

export function createEventLedger() {
  const seenEvents = new Set<string>()
  const latestVersions = new Map<string, number>()

  return {
    accept({ eventId, resource, id, version }: EventIdentity): boolean {
      if (seenEvents.has(eventId)) return false

      const key = `${resource}:${id}`
      if (version <= (latestVersions.get(key) ?? -1)) return false

      seenEvents.add(eventId)
      if (seenEvents.size > MAX_REMEMBERED_EVENTS) {
        const oldest = seenEvents.values().next().value
        if (oldest !== undefined) seenEvents.delete(oldest)
      }
      latestVersions.set(key, version)
      return true
    },
  }
}
