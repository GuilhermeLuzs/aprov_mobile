import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ApiError, apiCompanyCoupons, apiCouponShelves, apiRedeemCoupon, apiRedemptions, type ApiCoupon, type ApiRedemption, type ApiWallet } from '../api';
import type { Company, Coupon, CouponRedemption } from '../types';
import { queryClient, queryKeys } from './client';
import { companyFromSummary } from './mappers';

const COUPONS_KEY = ['coupons'] as const;

export type CouponShelf = { company: Company; count: number; offers: Coupon[] };

function couponFromApi(coupon: ApiCoupon): Coupon {
  return {
    id: String(coupon.id),
    companyId: String(coupon.companyId),
    title: coupon.title,
    description: coupon.description ?? '',
    coinCost: coupon.coinCost,
    validUntil: coupon.validUntil,
  };
}

function redemptionFromApi(redemption: ApiRedemption): CouponRedemption {
  return {
    id: String(redemption.id),
    couponId: String(redemption.couponId),
    title: redemption.title ?? 'Cupom',
    companyName: redemption.company.name,
    code: redemption.code,
    redeemedAt: redemption.redeemedAt,
  };
}

export function useCouponShelves(page: number, search = '') {
  return useQuery({
    queryKey: [...COUPONS_KEY, 'shelves', page, search],
    queryFn: () => apiCouponShelves(page, search),
    placeholderData: keepPreviousData,
    select: (data) => ({
      pageCount: data.pageCount,
      shelves: data.companies.map(
        (shelf): CouponShelf => ({ company: companyFromSummary(shelf.company), count: shelf.couponCount, offers: shelf.coupons.map(couponFromApi) }),
      ),
    }),
  });
}

export function useCompanyCoupons(companyId: string) {
  return useQuery({
    queryKey: [...COUPONS_KEY, 'company', companyId],
    queryFn: () => apiCompanyCoupons(companyId),
    select: (data) => data.map(couponFromApi),
  });
}

export function useRedemptions(): CouponRedemption[] {
  const query = useQuery({
    queryKey: [...COUPONS_KEY, 'redemptions'],
    queryFn: apiRedemptions,
    select: (data) => data.redemptions.map(redemptionFromApi),
  });
  return query.data ?? [];
}

export function newRedemptionKey(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    return (char === 'x' ? random : (random % 4) + 8).toString(16);
  });
}

export type RedeemResult = { redemption: CouponRedemption } | { error: string };

export async function redeemCoupon(coupon: Coupon, key: string): Promise<RedeemResult> {
  try {
    const result = await apiRedeemCoupon(coupon.id, key);
    const companyId = Number(coupon.companyId);
    queryClient.setQueryData<ApiWallet>(queryKeys.wallet, (wallet) =>
      wallet ? { ...wallet, coins: wallet.coins.map((c) => (c.companyId === companyId ? { ...c, amount: result.balance } : c)) } : wallet,
    );
    void queryClient.invalidateQueries({ queryKey: COUPONS_KEY });
    void queryClient.invalidateQueries({ queryKey: queryKeys.wallet });
    return { redemption: redemptionFromApi(result.redemption) };
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : 'Não deu para resgatar agora. Tente de novo.' };
  }
}
