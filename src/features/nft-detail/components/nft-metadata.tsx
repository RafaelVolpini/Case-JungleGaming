import { Mail } from 'lucide-react'

import { LinkedinIcon, TwitterIcon } from '@/components/icons/brand-icons'
import type { NftDetail } from '@/contracts/nft'
import { formatTokenId } from '@/lib/format/token'

const rowClassName = 'text-foreground text-[15px] leading-6'

export function NftMetadata({ nft }: { nft: NftDetail }) {
  const url = typeof window === 'undefined' ? '' : window.location.href
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(`${nft.name} na Kurio`)
  const shareLinks = [
    {
      label: 'Compartilhar no LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: <LinkedinIcon className="size-5" />,
    },
    {
      label: 'Compartilhar por e-mail',
      href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
      icon: <Mail className="size-5" />,
    },
    {
      label: 'Compartilhar no Twitter',
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      icon: <TwitterIcon className="size-5" />,
    },
  ]

  return (
    <dl className="mt-[14px] flex flex-col gap-2">
      <div className={rowClassName}>
        <dt className="inline">ID do token: </dt>
        <dd className="inline">{formatTokenId(nft.tokenId)}</dd>
      </div>
      <div className={rowClassName}>
        <dt className="inline">Coleção: </dt>
        <dd className="inline">{nft.series}</dd>
      </div>
      <div className={rowClassName}>
        <dt className="inline">Atributos: </dt>
        <dd className="inline">{nft.attributes.map((attribute) => attribute.value).join(', ')}</dd>
      </div>
      <div className="text-cream flex items-center gap-2 text-[15px] leading-6 font-bold">
        Compartilhar este NFT:
        <span className="flex items-center gap-2 font-normal">
          {shareLinks.map(({ label, href, icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="hover:text-primary-light transition-colors"
            >
              {icon}
            </a>
          ))}
        </span>
      </div>
    </dl>
  )
}
