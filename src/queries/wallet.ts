import { useQuery } from '@tanstack/react-query';
import { apiWallet, type ApiWallet } from '../api';
import type { Company } from '../types';
import { queryClient, queryKeys } from './client';
import { companyFromSummary } from './mappers';

export type CoinBalance = { companyId: string; amount: number; company: Company | undefined };

export type Wallet = { aprovPoints: number; xp: number; level: number; coins: CoinBalance[] };

export const EMPTY_WALLET: Wallet = { aprovPoints: 0, xp: 0, level: 1, coins: [] };

function toWallet(api: ApiWallet): Wallet {
  return {
    aprovPoints: api.aprovPoints,
    xp: api.xp,
    level: api.level,
    coins: api.coins.map((c) => ({
      companyId: String(c.companyId),
      amount: c.amount,
      company: c.company ? companyFromSummary(c.company) : undefined,
    })),
  };
}

export function useWallet(enabled = true): Wallet {
  const query = useQuery({ queryKey: queryKeys.wallet, queryFn: apiWallet, select: toWallet, enabled });
  return query.data ?? EMPTY_WALLET;
}

export function coinBalance(wallet: Wallet, companyId: string): number {
  return wallet.coins.find((c) => c.companyId === companyId)?.amount ?? 0;
}

export function totalCoins(wallet: Wallet): number {
  return wallet.coins.reduce((sum, c) => sum + c.amount, 0);
}

function spend(change: (wallet: ApiWallet) => ApiWallet | null): boolean {
  const current = queryClient.getQueryData<ApiWallet>(queryKeys.wallet);
  const next = current ? change(current) : null;
  if (!next) return false;
  queryClient.setQueryData(queryKeys.wallet, next);
  return true;
}

export function spendPoints(amount: number): boolean {
  return spend((wallet) => (wallet.aprovPoints < amount ? null : { ...wallet, aprovPoints: wallet.aprovPoints - amount }));
}

export function spendCoins(companyId: string, amount: number): boolean {
  const id = Number(companyId);
  return spend((wallet) => {
    const balance = wallet.coins.find((c) => c.companyId === id)?.amount ?? 0;
    if (balance < amount) return null;
    return {
      ...wallet,
      coins: wallet.coins.map((c) => (c.companyId === id ? { ...c, amount: c.amount - amount } : c)),
    };
  });
}
