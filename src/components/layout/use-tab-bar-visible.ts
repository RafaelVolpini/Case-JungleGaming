import { useRouterState } from '@tanstack/react-router'

const FULL_SCREEN_PREFIXES = [
  '/nft',
  '/carrinho',
  '/pagamento',
  '/pedido',
  '/entrar',
  '/criar-conta',
]

export function useTabBarVisible(): boolean {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  return !FULL_SCREEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}
