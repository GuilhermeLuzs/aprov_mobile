import { apiRequest } from './client';

export type ApiWallet = {
  aprovPoints: number;
  coins: { companyId: number; amount: number }[];
};

export async function apiWallet(): Promise<ApiWallet> {
  return apiRequest<ApiWallet>('me/wallet', { auth: true });
}
