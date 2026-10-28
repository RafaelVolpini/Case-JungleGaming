import { SearchDialog } from '@/features/catalog/components/search-dialog'

import { AccountControl } from './account-control'
import { CartLink } from './cart-link'
import { Logo } from './logo'
import { PrimaryNav } from './primary-nav'

export function SiteHeader() {
  return (
    <header className="border-primary/50 bg-background sticky top-0 z-40 hidden border-b md:block">
      <div className="page-container grid h-[68.5px] grid-cols-[1fr_auto_1fr] items-start gap-6">
        <div className="pt-7">
          <Logo />
        </div>
        <div className="pt-[22.5px] xl:-translate-x-6">
          <PrimaryNav />
        </div>
        <div className="mt-6 flex h-[35px] items-center justify-end gap-[26px]">
          <SearchDialog />
          <CartLink />
          <AccountControl />
        </div>
      </div>
    </header>
  )
}
