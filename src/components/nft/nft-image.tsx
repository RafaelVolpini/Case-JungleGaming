import type { ComponentProps } from 'react'

import type { NftSummary } from '@/contracts/nft'
import { nftSrcSet } from '@/lib/format/image'
import { cn } from '@/lib/utils'

type NftImageProps = Omit<ComponentProps<'img'>, 'src' | 'alt' | 'srcSet'> & {
  image: NftSummary['image']
  priority?: boolean
}

export function NftImage({ image, priority = false, className, sizes, ...props }: NftImageProps) {
  return (
    <img
      src={image.url}
      srcSet={nftSrcSet(image.url)}
      sizes={sizes ?? '(min-width: 768px) 260px, 50vw'}
      alt={image.alt}
      width={image.width}
      height={image.height}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      className={cn('aspect-square w-full object-cover', className)}
      {...props}
    />
  )
}
