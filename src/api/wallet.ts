import type { ApiCompanySummary } from './catalog';
import { apiRequest } from './client';

export type ApiWallet = {
  aprovPoints: number;
  xp: number;
  level: number;
  coins: { companyId: number; amount: number; couponCount: number; company?: ApiCompanySummary }[];
};

export async function apiWallet(): Promise<ApiWallet> {
  return apiRequest<ApiWallet>('me/wallet', { auth: true });
}
