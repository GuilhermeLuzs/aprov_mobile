import { useSyncExternalStore } from 'react';
import type { Coupon, CouponRedemption } from '../types';
import { spendCoins } from '../queries/wallet';

let redemptions: CouponRedemption[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function newCode(coupon: Coupon): string {
  const suffix = Math.floor(Math.random() * 10_000).toString().padStart(4, '0');
  return `${coupon.codePrefix}-${suffix}`;
}

export function redeemCoupon(coupon: Coupon): CouponRedemption | null {
  if (!spendCoins(coupon.companyId, coupon.coinCost)) return null;
  const redemption: CouponRedemption = {
    id: `${coupon.id}-${Date.now()}`,
    couponId: coupon.id,
    code: newCode(coupon),
    redeemedAt: new Date().toISOString(),
  };
  redemptions = [redemption, ...redemptions];
  emit();
  return redemption;
}

export function resetRedemptions(next: CouponRedemption[]): void {
  redemptions = next;
  emit();
}

function getRedemptions(): CouponRedemption[] {
  return redemptions;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useRedemptions(): CouponRedemption[] {
  return useSyncExternalStore(subscribe, getRedemptions, getRedemptions);
}
