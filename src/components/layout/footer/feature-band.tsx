import { FOOTER_FEATURES } from '@/content/footer'

import { FeatureItem } from './feature-item'
import { NewsletterForm } from './newsletter-form'

export function FeatureBand() {
  return (
    <section
      aria-label="Diferenciais da Kurio"
      className="bg-card grid h-auto md:grid-cols-2 lg:h-[250px] lg:grid-cols-[297fr_265.5fr_266fr_371.5fr]"
    >
      {FOOTER_FEATURES.map((feature, index) => (
        <FeatureItem key={feature.letter} {...feature} isFirst={index === 0} />
      ))}
      <NewsletterForm />
    </section>
  )
}
