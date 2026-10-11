import { useSyncExternalStore } from 'react';

let deactivatedIds: string[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function markDeactivated(userId: string): void {
  if (deactivatedIds.includes(userId)) return;
  deactivatedIds = [...deactivatedIds, userId];
  emit();
}

export function getDeactivatedIds(): string[] {
  return deactivatedIds;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useDeactivatedIds(): string[] {
  return useSyncExternalStore(subscribe, getDeactivatedIds, getDeactivatedIds);
}
