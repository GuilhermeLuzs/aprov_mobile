import { useState, type ReactNode } from 'react';
import { CouponSheet } from '../../components';
import { companies, couponById } from '../../mocks';
import { redeemCoupon } from '../../store/coupons';
import { coinBalance, useWallet } from '../../store/wallet';

export function useCouponSheet(): { openCoupon: (couponId: string) => void; sheet: ReactNode } {
  const wallet = useWallet();
  const [openId, setOpenId] = useState<string | null>(null);

  const coupon = openId ? couponById[openId] : undefined;
  const company = coupon ? companies.find((c) => c.id === coupon.companyId) : undefined;

  const sheet =
    coupon && company ? (
      <CouponSheet
        coupon={coupon}
        company={company}
        balance={coinBalance(wallet, company.id)}
        onClose={() => setOpenId(null)}
        onRedeem={() => redeemCoupon(coupon)}
      />
    ) : null;

  return { openCoupon: setOpenId, sheet };
}
