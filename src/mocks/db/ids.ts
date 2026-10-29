import { nextVersion } from './store'

export function mockId(prefix: string): string {
  return `${prefix}-${nextVersion().toString(36)}`
}
