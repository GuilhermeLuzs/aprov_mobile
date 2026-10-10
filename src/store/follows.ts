import { useSyncExternalStore } from 'react';
import { users } from '../mocks';

export const EMPTY_FOLLOWING: string[] = [];

export function seededFollowing(): string[] {
  return users.filter((u) => u.followedByCurrentUser).map((u) => u.id);
}

let state: string[] = seededFollowing();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function resetFollowing(next: string[]): void {
  state = next;
  emit();
}

function getFollowing(): string[] {
  return state;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useFollowing(): string[] {
  return useSyncExternalStore(subscribe, getFollowing, getFollowing);
}
