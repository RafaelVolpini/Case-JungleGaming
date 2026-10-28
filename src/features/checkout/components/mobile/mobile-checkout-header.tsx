import { BackButton } from '@/components/shared/back-button'

export function MobileCheckoutHeader() {
  return (
    <header className="flex h-[35px] items-center gap-6 pl-1">
      <BackButton fallback="/carrinho" />
      <h1 className="text-cream text-xl leading-7 font-bold">Pagamento com carteira</h1>
    </header>
  )
}
