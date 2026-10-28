export const API_UNREACHABLE_EVENT = 'kurio:api-unreachable'

export function notifyApiUnreachable(): void {
  window.dispatchEvent(new Event(API_UNREACHABLE_EVENT))
}
