import { COMPATIBLE_WALLETS, FOOTER_LINK_COLUMNS } from '@/content/footer'

import { FooterLinkItem } from './footer-link-item'
import { SocialLinks } from './social-links'

const headingClassName = 'text-cream text-lg leading-[26px] font-bold'

export function LinkColumns() {
  return (
    <nav
      aria-label="Rodapé"
      className="bg-card grid gap-x-[74px] gap-y-8 px-8 pt-[27px] pb-[31px] md:grid-cols-2 lg:min-h-[236px] lg:grid-cols-4"
    >
      {FOOTER_LINK_COLUMNS.map((column) => (
        <div key={column.title}>
          <h3 className={headingClassName}>{column.title}</h3>
          <ul className="mt-[7px] flex flex-col gap-2">
            {column.links.map((link) => (
              <li key={link.label} className="flex">
                <FooterLinkItem link={link} />
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div>
        <h3 className={headingClassName}>Redes sociais</h3>
        <SocialLinks />
        <h3 className={`${headingClassName} mt-[26px]`}>Carteiras compatíveis</h3>
        <p className="bg-brown text-primary-light mt-[7px] inline-flex items-center gap-[5px] rounded-md border border-[#55321f] px-2.5 py-1 text-[10px] leading-4 font-bold">
          {COMPATIBLE_WALLETS.map((wallet, index) => (
            <span key={wallet} className="inline-flex items-center gap-[5px]">
              {index > 0 && <span aria-hidden="true">•</span>}
              {wallet}
            </span>
          ))}
        </p>
      </div>
    </nav>
  )
}
