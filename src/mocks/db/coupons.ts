import { COUPON_FIXTURES, type CouponFixture } from '../fixtures/coupons'

export function findCoupon(code: string): CouponFixture | undefined {
  return COUPON_FIXTURES.find((coupon) => coupon.code.toLowerCase() === code.trim().toLowerCase())
}

export function isCouponExpired(coupon: CouponFixture, now = new Date()): boolean {
  return coupon.expiresAt !== null && new Date(coupon.expiresAt) <= now
}
