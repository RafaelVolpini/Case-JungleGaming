export type ConnectedClient = {
  emit: (event: string, payload: unknown) => void
  close: () => void
  userId: string | null
}

const clients = new Set<ConnectedClient>()

export function registerClient(client: ConnectedClient): void {
  clients.add(client)
}

export function unregisterClient(client: ConnectedClient): void {
  clients.delete(client)
}

export function connectedClients(): ReadonlySet<ConnectedClient> {
  return clients
}

export function connectedClientCount(): number {
  return clients.size
}

export function dropConnectedClients(): number {
  const dropped = clients.size
  for (const client of [...clients]) client.close()
  return dropped
}

export function emitToConnectedClients(event: string, payload: unknown): number {
  for (const client of clients) client.emit(event, payload)
  return clients.size
}
