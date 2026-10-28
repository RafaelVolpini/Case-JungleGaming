import type { OrderStatus } from '@/contracts/order'

const TITLES: Record<OrderStatus, string> = {
  confirmed: 'Seus NFTs agora estão na sua carteira',
  pending: 'Aguardando a confirmação da rede',
  declined: 'Não foi possível concluir o pagamento',
}

export function orderTitle(status: OrderStatus): string {
  return TITLES[status]
}
