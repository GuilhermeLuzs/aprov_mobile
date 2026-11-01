import { useSyncExternalStore } from 'react';
import { accessories } from '../mocks';
import type { AvatarFrame, Accessory, MauricioSkin } from '../types';
import { spendPoints } from './wallet';

export type AccessoriesState = {
  ownedIds: string[];
  equippedSkin: MauricioSkin;
  equippedFrameId: string | null;
};

export const EMPTY_ACCESSORIES: AccessoriesState = {
  ownedIds: [],
  equippedSkin: 'mauricio',
  equippedFrameId: null,
};

export type AccessoryStatus =
  | { kind: 'equipped' }
  | { kind: 'owned' }
  | { kind: 'buyable' }
  | { kind: 'short'; missing: number }
  | { kind: 'locked'; level: number };

let state: AccessoriesState = EMPTY_ACCESSORIES;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function isEquipped(owned: AccessoriesState, accessory: Accessory): boolean {
  return accessory.kind === 'skin'
    ? owned.equippedSkin === accessory.skin
    : owned.equippedFrameId === accessory.id;
}

export function accessoryStatus(
  owned: AccessoriesState,
  accessory: Accessory,
  points: number,
  level: number,
): AccessoryStatus {
  if (owned.ownedIds.includes(accessory.id)) {
    return isEquipped(owned, accessory) ? { kind: 'equipped' } : { kind: 'owned' };
  }
  if (level < accessory.level) return { kind: 'locked', level: accessory.level };
  const { price } = accessory;
  return points >= price ? { kind: 'buyable' } : { kind: 'short', missing: price - points };
}

export function buyAccessory(accessory: Accessory, level: number): boolean {
  if (state.ownedIds.includes(accessory.id) || level < accessory.level) return false;
  if (!spendPoints(accessory.price)) return false;
  state = { ...state, ownedIds: [...state.ownedIds, accessory.id] };
  emit();
  return true;
}

export function equipAccessory(accessory: Accessory): void {
  state =
    accessory.kind === 'skin'
      ? { ...state, equippedSkin: accessory.skin }
      : { ...state, equippedFrameId: accessory.id };
  emit();
}

export function resetAccessories(next: AccessoriesState): void {
  state = next;
  emit();
}

export function getAccessories(): AccessoriesState {
  return state;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useAccessories(): AccessoriesState {
  return useSyncExternalStore(subscribe, getAccessories, getAccessories);
}

export function useEquippedSkin(): MauricioSkin {
  return useAccessories().equippedSkin;
}

export function useEquippedFrame(): AvatarFrame | undefined {
  const { equippedFrameId } = useAccessories();
  const equipped = accessories.find((c) => c.id === equippedFrameId);
  return equipped?.kind === 'frame' ? equipped.frame : undefined;
}
