export function shortAddress(address: string, ellipsis = '...'): string {
  if (address.startsWith('0x')) {
    const hex = address.slice(2)
    return `0x${hex.slice(0, 4).toUpperCase()}${ellipsis}${hex.slice(-4).toUpperCase()}`
  }
  return `${address.slice(0, 4)}${ellipsis}${address.slice(-4)}`
}
