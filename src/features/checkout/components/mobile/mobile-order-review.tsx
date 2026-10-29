import type { Cart } from '@/contracts/cart'
import type { Quote } from '@/contracts/quote'
import { formatEth, isZeroEth } from '@/lib/money/eth'

type MobileOrderReviewProps = { items: Cart['items']; totals: Quote['totals'] }

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className={strong ? 'text-cream font-bold' : 'text-foreground'}>{label}</dt>
      <dd className={strong ? 'text-primary-light font-bold' : 'text-cream'}>{value}</dd>
    </div>
  )
}

export function MobileOrderReview({ items, totals }: MobileOrderReviewProps) {
  return (
    <section
      aria-label="Resumo do pedido"
      className="border-primary/30 bg-background/40 rounded-lg border p-3 text-sm"
    >
      <ul aria-label="Itens do pedido" className="flex flex-col gap-1.5">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3">
            <span className="text-cream truncate">
              {item.name} (x{item.quantity})
            </span>
            <span className="text-primary-light shrink-0">{formatEth(item.subtotalEth)}</span>
          </li>
        ))}
      </ul>
      <dl className="border-primary/30 mt-2 flex flex-col gap-1 border-t pt-2">
        <Row label="Subtotal" value={formatEth(totals.subtotalEth)} />
        {!isZeroEth(totals.discountEth) && (
          <Row label="Desconto" value={`(-) ${formatEth(totals.discountEth)}`} />
        )}
        <Row label="Taxa de rede" value={formatEth(totals.networkFeeEth)} />
        <Row label="Total" value={formatEth(totals.totalEth)} strong />
      </dl>
    </section>
  )
}
