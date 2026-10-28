const SIZE_SUFFIX = /-\d+(\.webp)$/

export function nftSrcSet(url: string): string | undefined {
  if (!SIZE_SUFFIX.test(url)) return undefined
  return [480, 960]
    .map((width) => `${url.replace(SIZE_SUFFIX, `-${width}$1`)} ${width}w`)
    .join(', ')
}

export type ArtId = 'golden' | 'ivory' | 'emerald' | 'sage'

export function artUrl(art: ArtId, width: 480 | 960 = 960): string {
  return `/nft/${art}-${width}.webp`
}
