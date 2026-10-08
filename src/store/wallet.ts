import { useSyncExternalStore } from 'react';
import { currentUser, initialWallet, xpPerLevel, type CoinBalance } from '../mocks';
import type { User } from '../types';
import { levelProgress } from '../utils/level';

export type WalletState = {
  aprovPoints: number;
  xp: number;
  coins: CoinBalance[];
};

let state: WalletState = {
  aprovPoints: initialWallet.aprovPoints,
  xp: currentUser.xp,
  coins: initialWallet.coins,
};
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export type Credit = { companyId: string; coins: number; points: number; xp: number };

export function creditRewards({ companyId, coins, points, xp }: Credit): void {
  const existing = state.coins.find((c) => c.companyId === companyId);
  const nextCoins = existing
    ? state.coins.map((c) => (c.companyId === companyId ? { ...c, amount: c.amount + coins } : c))
    : [...state.coins, { companyId, amount: coins }];
  state = {
    aprovPoints: state.aprovPoints + points,
    xp: state.xp + xp,
    coins: nextCoins,
  };
  emit();
}

export function getWallet(): WalletState {
  return state;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useWallet(): WalletState {
  return useSyncExternalStore(subscribe, getWallet, getWallet);
}

export function useCurrentUser(): User {
  const { xp } = useWallet();
  const { level } = levelProgress(xp, xpPerLevel);
  return { ...currentUser, xp, level };
}
