import { FOOTER_FEATURES } from '@/content/footer'

import { FeatureItem } from './feature-item'
import { NewsletterForm } from './newsletter-form'

export function FeatureBand() {
  return (
    <section
      aria-label="Diferenciais da Kurio"
      className="bg-card grid h-auto md:grid-cols-2 lg:h-[250px] lg:grid-cols-[290fr_258fr_258fr_394fr]"
    >
      {FOOTER_FEATURES.map((feature, index) => (
        <FeatureItem key={feature.letter} {...feature} isFirst={index === 0} />
      ))}
      <NewsletterForm />
    </section>
  )
}
