import type { EthAmount } from '@/contracts/common'
import type { ScenarioConfig } from '@/contracts/mock-scenario'
import { http } from '@/lib/http/client'

const CONTROL = '/__mock__'

export type NftChange = { priceEth?: EthAmount; edition?: string; available?: number }
export type NftChangeResult = { id: string; version: number; priceEth: EthAmount }
export type SocketState = { clients: number; outageMs: number }
export type ReplayMode = 'duplicate' | 'stale'
export type ReplayResult = { delivered: number; mode: ReplayMode; eventId: string; version: number }

export async function changeNft(slug: string, change: NftChange): Promise<NftChangeResult> {
  const { data } = await http.post<NftChangeResult>(`${CONTROL}/nfts/${slug}`, change)
  return data
}

export async function replayNftEvent(slug: string, mode: ReplayMode): Promise<ReplayResult> {
  const { data } = await http.post<ReplayResult>(`${CONTROL}/socket/replay`, { slug, mode })
  return data
}

export async function dropSocket(holdMs: number): Promise<void> {
  await http.post(`${CONTROL}/socket/drop`, { holdMs })
}

export async function reconnectSocket(): Promise<void> {
  await http.post(`${CONTROL}/socket/reconnect`)
}

export async function readSocketState(): Promise<SocketState> {
  const { data } = await http.get<SocketState>(`${CONTROL}/socket`)
  return data
}

export async function readScenario(): Promise<ScenarioConfig> {
  const { data } = await http.get<ScenarioConfig>(`${CONTROL}/scenario`)
  return data
}

export async function patchScenario(patch: Partial<ScenarioConfig>): Promise<ScenarioConfig> {
  const { data } = await http.post<ScenarioConfig>(`${CONTROL}/scenario`, patch)
  return data
}

export async function resetMockData(): Promise<void> {
  await http.post(`${CONTROL}/reset`, {})
}
