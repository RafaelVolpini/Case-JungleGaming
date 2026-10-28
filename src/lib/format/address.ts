export function shortAddress(address: string): string {
  if (address.startsWith('0x')) {
    const hex = address.slice(2)
    return `0x${hex.slice(0, 4).toUpperCase()}...${hex.slice(-4).toUpperCase()}`
  }
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}
