import { useSyncExternalStore } from 'react';
import type { Category, UserGoal } from '../types';

export type Preferences = {
  categories: Category[];
  companyIds: string[];
  goal: UserGoal | null;
  notifications: boolean;
};

const EMPTY: Preferences = {
  categories: [],
  companyIds: [],
  goal: null,
  notifications: false,
};

let state: Preferences = EMPTY;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function getPreferences(): Preferences {
  return state;
}

export function setPreferences(patch: Partial<Preferences>): void {
  state = { ...state, ...patch };
  emit();
}

export function resetPreferences(): void {
  state = EMPTY;
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function usePreferences(): Preferences {
  return useSyncExternalStore(subscribe, getPreferences, getPreferences);
}
