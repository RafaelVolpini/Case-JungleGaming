import { Link } from '@tanstack/react-router'

import { WalletOptionRing } from './wallet-option-ring'

const PROVIDERS = ['MetaMask', 'WalletConnect', 'Coinbase']

export function WalletProviderCard() {
  return (
    <Link
      to="/perfil/carteiras"
      aria-label="Gerenciar carteiras: MetaMask, WalletConnect e Coinbase"
      className="border-input hover:border-primary/60 focus-visible:ring-ring flex h-11 w-full items-center gap-2.5 rounded-[3px] border px-3 pt-1 outline-none focus-visible:ring-2"
    >
      <WalletOptionRing />
      <span className="border-[#55321f] bg-brown text-primary-light flex h-[26px] items-center gap-3 rounded-lg border px-2 text-[9px] leading-none font-bold uppercase">
        {PROVIDERS.map((provider, index) => (
          <span key={provider} className="flex items-center gap-3">
            {index > 0 && <span aria-hidden="true">•</span>}
            {provider}
          </span>
        ))}
      </span>
    </Link>
  )
}
