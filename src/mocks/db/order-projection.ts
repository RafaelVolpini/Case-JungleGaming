import type { Order } from '@/contracts/order'

import type { OrderRecord } from './types'

export function projectOrder(order: OrderRecord): Order {
  return {
    id: order.id,
    reference: order.reference,
    status: order.status,
    items: order.items.map((item) => ({
      nftId: item.nftId,
      nftSlug: item.nftSlug,
      name: item.name,
      tokenId: item.tokenId,
      image: { url: item.imageUrl, alt: item.imageAlt, width: 960, height: 960 },
      edition: {
        id: item.editionId,
        label: item.editionLabel,
        index: item.editionIndex,
        total: item.editionTotal,
      },
      quantity: item.quantity,
      unitPriceEth: item.unitPriceEth,
      subtotalEth: item.subtotalEth,
    })),
    totals: {
      subtotalEth: order.subtotalEth,
      discountEth: order.discountEth,
      networkFeeEth: order.networkFeeEth,
      totalEth: order.totalEth,
    },
    coupon:
      order.couponCode && order.couponDescription
        ? {
            code: order.couponCode,
            description: order.couponDescription,
            discountEth: order.discountEth,
          }
        : null,
    wallet: {
      id: order.walletId,
      label: order.walletLabel,
      address: order.walletAddress,
      network: order.network,
      walletType: order.walletType,
    },
    explorerUrl: order.explorerUrl,
    createdAt: order.createdAt,
    confirmedAt: order.confirmedAt,
    declinedReason: order.declinedReason,
    version: order.version,
  }
}
