import { Link } from '@tanstack/react-router'

import { SiteShell } from '@/components/layout/site-shell'
import { buttonVariants } from '@/components/ui/button'

export function NotFoundContent() {
  return (
    <section className="page-container flex flex-col items-center py-24 text-center">
      <p className="text-primary text-sm font-bold tracking-wider uppercase">Erro 404</p>
      <h1 className="text-cream mt-3 text-2xl font-bold md:text-[32px]">Página não encontrada</h1>
      <p className="text-foreground mt-3 max-w-md text-sm md:text-base">
        O endereço que você acessou não existe ou foi removido do mercado.
      </p>
      <Link to="/" className={buttonVariants({ size: 'lg', className: 'mt-8' })}>
        Voltar ao início
      </Link>
    </section>
  )
}

export function NotFoundScreen() {
  return (
    <SiteShell>
      <NotFoundContent />
    </SiteShell>
  )
}
