import { useState, type ReactNode } from 'react';
import { CouponSheet } from '../../components';
import { newRedemptionKey, redeemCoupon } from '../../queries/coupons';
import { coinBalance, useWallet } from '../../queries/wallet';
import type { Company, Coupon } from '../../types';

type Open = { coupon: Coupon; company: Company; key: string };

export function useCouponSheet(): { openCoupon: (coupon: Coupon, company: Company) => void; sheet: ReactNode } {
  const wallet = useWallet();
  const [open, setOpen] = useState<Open | null>(null);

  const sheet = open ? (
    <CouponSheet
      coupon={open.coupon}
      company={open.company}
      balance={coinBalance(wallet, open.company.id)}
      onClose={() => setOpen(null)}
      onRedeem={() => redeemCoupon(open.coupon, open.key)}
    />
  ) : null;

  return { openCoupon: (coupon, company) => setOpen({ coupon, company, key: newRedemptionKey() }), sheet };
}
