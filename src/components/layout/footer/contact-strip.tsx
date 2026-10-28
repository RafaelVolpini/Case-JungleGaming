import { FOOTER_CONTACT } from '@/content/footer'

export function ContactStrip() {
  return (
    <section
      aria-label="Contato"
      className="bg-brown text-cream grid items-center gap-x-[74px] gap-y-4 px-8 py-6 text-sm md:grid-cols-2 lg:h-[88px] lg:grid-cols-4 lg:py-0"
    >
      <p className="text-sm font-bold tracking-[0.1em]">KURIO</p>
      <p className="max-w-[228px] leading-[22px]">{FOOTER_CONTACT.slogan}</p>
      <a href={`mailto:${FOOTER_CONTACT.email}`} className="hover:text-primary-light w-fit">
        {FOOTER_CONTACT.email}
      </a>
      <a
        href={`tel:${FOOTER_CONTACT.phone.replaceAll(' ', '')}`}
        className="hover:text-primary-light w-fit"
      >
        {FOOTER_CONTACT.phone}
      </a>
    </section>
  )
}
