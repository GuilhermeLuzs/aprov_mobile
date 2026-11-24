import type { ApiCompanySummary } from './catalog';
import { apiRequest } from './client';

export type ApiCoupon = {
  id: number;
  companyId: number;
  title: string;
  description: string | null;
  coinCost: number;
  validUntil: string;
};

export type ApiCouponShelf = { company: ApiCompanySummary; couponCount: number; coupons: ApiCoupon[] };

export type ApiRedemption = {
  id: number;
  couponId: number;
  title: string | null;
  company: ApiCompanySummary;
  code: string;
  coinsSpent: number;
  redeemedAt: string;
};

type Page<K extends string, T> = { page: number; pageCount: number; total: number } & Record<K, T[]>;

export async function apiCouponShelves(page: number, search = ''): Promise<Page<'companies', ApiCouponShelf>> {
  const params = new URLSearchParams({ page: String(page) });
  if (search.trim()) params.set('search', search.trim());
  return apiRequest(`coupons/companies?${params.toString()}`);
}

export async function apiCompanyCoupons(companyId: string): Promise<ApiCoupon[]> {
  return apiRequest(`companies/${companyId}/coupons`);
}

export async function apiRedemptions(): Promise<Page<'redemptions', ApiRedemption>> {
  return apiRequest('me/redemptions');
}

export async function apiRedeemCoupon(couponId: string, key: string): Promise<{ redemption: ApiRedemption; balance: number }> {
  return apiRequest(`coupons/${couponId}/redeem`, { method: 'POST', headers: { 'Idempotency-Key': key } });
}
