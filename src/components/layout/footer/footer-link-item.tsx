import { Link } from '@tanstack/react-router'

import { UnavailableAction } from '@/components/shared/unavailable-action'
import type { FooterLink } from '@/content/footer'
import { catalogSearch } from '@/features/catalog/search'

const linkClassName =
  'text-cream hover:text-primary-light text-left text-sm leading-[22px] transition-colors'

export function FooterLinkItem({ link }: { link: FooterLink }) {
  if (link.kind === 'route') {
    return (
      <Link to={link.to} className={linkClassName}>
        {link.label}
      </Link>
    )
  }

  if (link.kind === 'collection') {
    return (
      <Link
        to="/"
        search={catalogSearch({ collections: [link.collectionId] })}
        hash="catalogo"
        className={linkClassName}
      >
        {link.label}
      </Link>
    )
  }

  return (
    <UnavailableAction subject={link.label} className={linkClassName}>
      {link.label}
    </UnavailableAction>
  )
}
