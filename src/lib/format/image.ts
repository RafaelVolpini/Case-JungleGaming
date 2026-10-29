export const NFT_ART_WIDTHS = [160, 240, 320, 480, 720, 960] as const
export type NftArtWidth = (typeof NFT_ART_WIDTHS)[number]

export const MOBILE_CARD_SIZES = '(min-width: 640px) 280px, calc(50vw - 40px)'
export const MOBILE_COVER_SIZES = 'calc(min(100vw, 640px) - 53px)'

const SIZE_SUFFIX = /-\d+(\.webp)$/

export function nftSrcSet(url: string): string | undefined {
  if (!SIZE_SUFFIX.test(url)) return undefined
  return NFT_ART_WIDTHS.map((width) => `${url.replace(SIZE_SUFFIX, `-${width}$1`)} ${width}w`).join(
    ', ',
  )
}

export type ArtId = 'golden' | 'ivory' | 'emerald' | 'sage'

export function artUrl(art: ArtId, width: NftArtWidth = 960): string {
  return `/nft/${art}-${width}.webp`
}
