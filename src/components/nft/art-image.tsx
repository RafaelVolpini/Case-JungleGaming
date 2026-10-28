import type { ComponentProps } from 'react'

import { artUrl, nftSrcSet, type ArtId } from '@/lib/format/image'

type ArtImageProps = Omit<ComponentProps<'img'>, 'src' | 'srcSet' | 'alt'> & {
  art: ArtId
  alt: string
}

export function ArtImage({ art, alt, sizes, ...props }: ArtImageProps) {
  return (
    <img
      src={artUrl(art)}
      srcSet={nftSrcSet(artUrl(art))}
      sizes={sizes ?? '(min-width: 768px) 300px, 100vw'}
      alt={alt}
      width={960}
      height={960}
      loading="lazy"
      decoding="async"
      {...props}
    />
  )
}
