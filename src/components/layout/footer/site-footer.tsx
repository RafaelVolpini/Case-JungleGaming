import { COPYRIGHT } from '@/content/footer'

import { ContactStrip } from './contact-strip'
import { FeatureBand } from './feature-band'
import { LinkColumns } from './link-columns'

export function SiteFooter() {
  return (
    <footer className="page-container mt-24 hidden xl:block">
      <FeatureBand />
      <ContactStrip />
      <LinkColumns />
      <p className="text-cream pt-3 pb-7 text-center text-sm">{COPYRIGHT}</p>
    </footer>
  )
}
