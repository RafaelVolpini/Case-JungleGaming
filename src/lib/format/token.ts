export function formatTokenId(tokenId: string): string {
  return `#${tokenId.replace('#', '').padStart(4, '0')}`
}
