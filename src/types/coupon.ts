export interface Coupon {
  id: string;
  companyId: string;
  title: string;
  description: string;
  coinCost: number;
  validUntil: string;
  codePrefix: string;
}

export interface CouponRedemption {
  id: string;
  couponId: string;
  code: string;
  redeemedAt: string;
}
