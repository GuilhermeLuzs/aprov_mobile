export interface Coupon {
  id: string;
  companyId: string;
  title: string;
  description: string;
  coinCost: number;
  validUntil: string;
}

export interface CouponRedemption {
  id: string;
  couponId: string;
  title: string;
  companyName: string;
  code: string;
  redeemedAt: string;
}
