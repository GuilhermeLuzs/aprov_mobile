import { useState, type ReactNode } from 'react';
import { CouponSheet } from '../../components';
import { couponById } from '../../mocks';
import { useCompanies } from '../../queries/catalog';
import { redeemCoupon } from '../../store/coupons';
import { coinBalance, useWallet } from '../../queries/wallet';

export function useCouponSheet(): { openCoupon: (couponId: string) => void; sheet: ReactNode } {
  const wallet = useWallet();
  const [openId, setOpenId] = useState<string | null>(null);
  const companies = useCompanies().data ?? [];

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
