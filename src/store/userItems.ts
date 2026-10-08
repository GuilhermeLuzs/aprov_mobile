import { useSyncExternalStore } from 'react';
import { products } from '../mocks';

export type UserItems = {
  savedIds: string[];
  purchasedIds: string[];
};

let state: UserItems = {
  savedIds: products.filter((p) => p.savedByCurrentUser).map((p) => p.id),
  purchasedIds: products.filter((p) => p.purchasedByCurrentUser).map((p) => p.id),
};
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function toggled(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

export function toggleSaved(productId: string): void {
  state = { ...state, savedIds: toggled(state.savedIds, productId) };
  emit();
}

export function togglePurchased(productId: string): void {
  state = { ...state, purchasedIds: toggled(state.purchasedIds, productId) };
  emit();
}

export function getUserItems(): UserItems {
  return state;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useUserItems(): UserItems {
  return useSyncExternalStore(subscribe, getUserItems, getUserItems);
}
